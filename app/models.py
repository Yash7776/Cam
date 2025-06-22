from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import make_password
import re
from django.contrib.postgres.fields import ArrayField

class UniqueIdHeaderAll(models.Model):
    table_name = models.CharField(max_length=100)
    id_for = models.CharField(max_length=50)
    prefix = models.CharField(max_length=3)  # E.g., UHA, DEP
    last_id = models.CharField(max_length=15)  # E.g., UHA-00001
    created_on = models.DateTimeField()
    modified_on = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.created_on:
            self.created_on = timezone.now()
        self.modified_on = timezone.now()
        super().save(*args, **kwargs)

    def get_next_id(self):
        if not self.last_id:
            # Initialize with the first ID, e.g., UHA-00001
            next_id = f"{self.prefix}-00001"
            self.last_id = next_id
            self.save()
            return next_id

        # Parse the last_id, e.g., UHA-ZA001 -> prefix: UHA, alphabets: ZA, digits: 001
        last_id_parts = self.last_id.split('-')
        if len(last_id_parts) != 2:
            raise ValueError(f"Invalid last_id format: {self.last_id}")

        prefix, rest = last_id_parts
        alphabets = ''.join(re.findall(r'[A-Z]', rest))
        digits = ''.join(re.findall(r'\d+', rest))

        # Total length of alphabets + digits must be 5
        alpha_len = len(alphabets)
        digit_len = 5 - alpha_len  # Number of digits decreases as alphabets increase

        if alpha_len == 5:
            raise ValueError("Reached the maximum ID limit: ZZZZZ")

        # Check if we need to increment the alphabetic part
        if digits == '9' * digit_len:  # e.g., 9999, 999, 99, 9
            if alphabets == 'Z' and alpha_len == 1:
                alphabets = 'ZA'  # Z -> ZA
                digits = '001'    # 3 digits (ZA001)
            elif alphabets == 'ZZ' and alpha_len == 2:
                alphabets = 'ZZA'  # ZZ -> ZZA
                digits = '01'      # 2 digits (ZZA01)
            elif alphabets == 'ZZZ' and alpha_len == 3:
                alphabets = 'ZZZZ'  # ZZZ -> ZZZZ
                digits = '1'        # 1 digit (ZZZZ1)
            elif alphabets == 'ZZZZ' and alpha_len == 4:
                alphabets = 'ZZZZZ'  # ZZZZ -> ZZZZZ
                digits = ''          # 0 digits (ZZZZZ)
            elif alpha_len == 0:
                alphabets = 'A'      # 9999 -> A0001
                digits = '0001'      # 4 digits (A0001)
            elif alpha_len in [1, 2, 3] and alphabets[-1] != 'Z':
                # A -> B, ZA -> ZB, ZZA -> ZZB
                last_char = alphabets[-1]
                alphabets = alphabets[:-1] + chr(ord(last_char) + 1)
                digits = '1'.zfill(digit_len)  # Reset digits (e.g., 0001, 001, 01)
            elif alpha_len in [2, 3] and alphabets[-1] == 'Z':
                # ZA -> ZZA, ZZA -> ZZZA
                alphabets += 'A'
                digits = '1'.zfill(digit_len - 1)  # One less digit (e.g., 001, 01)
        else:
            # Increment the numeric part
            next_number = int(digits) + 1
            digits = str(next_number).zfill(digit_len)

        # Construct the next ID
        next_id = f"{self.prefix}-{alphabets}{digits}"
        self.last_id = next_id
        self.save()
        return next_id

    def __str__(self):
        return f"{self.table_name}"

class Profile_header_all(models.Model):
    STATUS_CHOICES = (
        (1, 'Active'),
        (0, 'Deactive'),
    )

    profile_id = models.CharField(max_length=20, unique=True, blank=True)
    profile_name = models.CharField(max_length=100)
    pro_form_ids = ArrayField(models.CharField(max_length=100), blank=True, null=True, default=list)
    pro_process_ids = ArrayField(models.CharField(max_length=100), blank=True, null=True, default=list)
    inserted_on = models.DateTimeField(auto_now_add=True)
    deactivated_on = models.DateTimeField(blank=True, null=True, default=None)
    profile_status = models.IntegerField(choices=STATUS_CHOICES, default=1)

    def __str__(self):
        return f"{self.profile_id} - {self.profile_name}"

    def save(self, *args, **kwargs):
        if not self.profile_id:
            unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
                table_name='profile_header_all',
                id_for='profile_id',
                defaults={
                    'prefix': 'PFL',
                    'last_id': '',
                    'created_on': timezone.now(),
                    'modified_on': timezone.now()
                }
            )
            self.profile_id = unique_id.get_next_id()
        super().save(*args, **kwargs)

    @classmethod
    def get_or_assign_profile_id(cls, profile_name):
        existing_profile = cls.objects.filter(profile_name=profile_name).first()
        if existing_profile:
            return existing_profile.profile_id
        unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
            table_name='profile_header_all',
            id_for='profile_id',
            defaults={
                'prefix': 'PFL',
                'last_id': '',
                'created_on': timezone.now(),
                'modified_on': timezone.now()
            }
        )
        return unique_id.get_next_id()

class Department(models.Model):
    dept_id = models.CharField(max_length=20, unique=True, blank=True)
    dept_name = models.CharField(max_length=100, unique=True)
    dept_full_name = models.CharField(max_length=100, unique=True)
    dept_logo = models.ImageField(upload_to='department_logos/', null=True, blank=True)
    dept_no_of_projects = models.PositiveIntegerField(default=0)
    dept_reg_contractors = models.PositiveIntegerField(default=0)
    dept_status = models.IntegerField(choices=[(0, 'Suspend'), (1, 'Active')], default=1)
    dept_admins_users = models.PositiveIntegerField(default=0)
    link = models.URLField(max_length=200, blank=True)
    dept_login_bg = models.ImageField(upload_to='department_backgrounds/login/', null=True, blank=True)
    dept_dashboard_bg = models.ImageField(upload_to='department_backgrounds/dashboard/', null=True, blank=True)

    def __str__(self):
        return f"{self.dept_id} - {self.dept_name}"

    def save(self, *args, **kwargs):
        if not self.dept_id:
            unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
                table_name='department',
                id_for='dept_id',
                defaults={
                    'prefix': 'DEP',
                    'last_id': '',
                    'created_on': timezone.now(),
                    'modified_on': timezone.now()
                }
            )
            self.dept_id = unique_id.get_next_id()

        if not self.link:
            base_url = "http://127.0.0.1:8000"
            path = reverse('login', args=[self.dept_name])
            self.link = f"{base_url}{path}"

        super().save(*args, **kwargs)

    @classmethod
    def get_or_assign_dept_id(cls, dept_name):
        existing_dept = cls.objects.filter(dept_name=dept_name).first()
        if existing_dept:
            return existing_dept.dept_id
        unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
            table_name='department',
            id_for='dept_id',
            defaults={
                'prefix': 'DEP',
                'last_id': '',
                'created_on': timezone.now(),
                'modified_on': timezone.now()
            }
        )
        return unique_id.get_next_id()

class User_header_all(models.Model):
    mobile_validator = RegexValidator(
        regex=r'^[6-9]\d{9}$',
        message='Mobile number must be 10 digits and start with 6, 7, 8, or 9.'
    )
    STATUS_CHOICES = (
        (1, 'Active'),
        (0, 'Deactive'),
    )
    USER_TYPE_CHOICES = (
        (1, 'Platform owner'),
        (2, 'Department'),
        (3, 'Contractor'),
    )

    user_id = models.CharField(max_length=15, blank=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150, blank=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)
    mobile_no = models.CharField(max_length=10, blank=True, validators=[mobile_validator])
    line_no = models.IntegerField(default=0)
    profile_id = models.ForeignKey(
        'Profile_header_all',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        to_field='profile_id',
        related_name='user_assignments'
    )
    department = models.ForeignKey(
        'Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        to_field='dept_id',
        related_name='users'
    )
    project_id = models.JSONField(default=dict, null=True, blank=True)
    user_type = models.IntegerField(choices=USER_TYPE_CHOICES, blank=True, null=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=1)
    inserted_on = models.DateTimeField(auto_now_add=True)
    deactivated_on = models.DateTimeField(blank=True, null=True, default=None)

    class Meta:
        unique_together = ('user_id', 'line_no')

    def __str__(self):
        return f"{self.user_id} - {self.username} (Line {self.line_no})"

    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = self.get_or_assign_user_id(self.username)
        
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        
        super().save(*args, **kwargs)

    @classmethod
    def get_or_assign_user_id(cls, username):
        existing_user = cls.objects.filter(username=username, line_no=0).first()
        if existing_user:
            return existing_user.user_id

        unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
            table_name='user_header_all',
            id_for='user_id',
            defaults={
                'prefix': 'UHA',
                'last_id': '',
                'created_on': timezone.now(),
                'modified_on': timezone.now()
            }
        )
        return unique_id.get_next_id()
    
    
class Project(models.Model):
    YES_NO_CHOICES = [('Yes', 'Yes'), ('No', 'No')]

    project_id = models.CharField(max_length=20, unique=True, blank=True)
    project_name = models.CharField(max_length=100)
    project_description = models.TextField(blank=True)
    project_details_KM = models.CharField(max_length=100)
    
    SUSPEND = 0
    ACTIVE = 1
    STATUS_CHOICES = [(SUSPEND, 'Suspend'), (ACTIVE, 'Active')]
    project_status = models.IntegerField(choices=STATUS_CHOICES, default=ACTIVE)
    
    project_type = models.CharField(max_length=100)
    project_admin_name = models.CharField(max_length=100)
    project_reg_contractors = models.PositiveIntegerField(default=0)
    project_admin_users = models.PositiveIntegerField(default=0)
    
    from_KM = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    to_KM = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True, related_name='projects')

    step_statuses = models.JSONField(default=dict, blank=True)
    
    survey_properties = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='Yes')
    field_survey = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='No')
    plot = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='Yes')
    land = models.CharField(max_length=3, choices=YES_NO_CHOICES, default='Yes')
    
    project_image = models.ImageField(upload_to='project_images/', null=True, blank=True)
    
    submenus = ArrayField(models.CharField(max_length=100), blank=True, null=True, default=list)

    def __str__(self):
        return f"{self.project_id} - {self.project_name}"

    def save(self, *args, **kwargs):
        if not self.project_id:
            unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
                table_name='project',
                id_for='project_id',
                defaults={
                    'prefix': 'PRO',
                    'last_id': '',
                    'created_on': timezone.now(),
                    'modified_on': timezone.now()
                }
            )
            self.project_id = unique_id.get_next_id()

        super().save(*args, **kwargs)

    @classmethod
    def get_or_assign_project_id(cls, project_name):
        existing_project = cls.objects.filter(project_name=project_name).first()
        if existing_project:
            return existing_project.project_id
        unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
            table_name='project',
            id_for='project_id',
            defaults={
                'prefix': 'PRO',
                'last_id': '',
                'created_on': timezone.now(),
                'modified_on': timezone.now()
            }
        )
        return unique_id.get_next_id()
    
class Project_ip_camera_details_all(models.Model):
    camera_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    location_name = models.CharField(max_length=100)
    ip_link = models.CharField(max_length=300)
    user_name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    status = models.IntegerField(default=1)  # 1=active, 0=inactive
    last_connected = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.location_name

    @classmethod
    def get_or_assign_camera_id(cls, location_name):
        existing_camera = cls.objects.filter(location_name=location_name).first()
        if existing_camera:
            return existing_camera.camera_id
        unique_id, _ = UniqueIdHeaderAll.objects.get_or_create(
            table_name='project_ip_camera_details_all',
            id_for='camera_id',
            defaults={
                'prefix': 'CAM',
                'last_id': '',
                'created_on': timezone.now(),
                'modified_on': timezone.now()
            }
        )
        return unique_id.get_next_id()

    def save(self, *args, **kwargs):
        if not self.camera_id:
            self.camera_id = self.get_or_assign_camera_id(self.location_name)
        super().save(*args, **kwargs)
import json
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
from .models import CameraGroupHeaderAll, Department, CameraGroupDetailsAll, User_header_all, Project
import logging
from django.http import HttpResponse
from django.views.decorators.clickjacking import xframe_options_exempt


logger = logging.getLogger(__name__)

def login(request, dept_name):
    department = get_object_or_404(Department, dept_name=dept_name)
    
    if request.method == 'POST':
        username = request.POST.get('u_user_id')
        password = request.POST.get('u_password')
        
        if not username or not password:
            return render(request, 'login.html', {
                'department': department,
                'error': 'Username and password are required'
            })

        try:
            # Fetch the user with the given username, line_no=0, and status=1
            base_user = User_header_all.objects.filter(username=username, line_no=0, status=1).first()
            if not base_user:
                logger.debug(f"User not found or inactive: {username}")
                return render(request, 'login.html', {
                    'department': department,
                    'error': 'Invalid username or password'
                })

            # Check if the user's department matches the URL dept_name
            if base_user.department and base_user.department.dept_name != dept_name:
                logger.debug(f"User {username} attempted login from incorrect department URL: {dept_name}")
                return render(request, 'login.html', {
                    'department': department,
                    'error': f"You can only log in from http://127.0.0.1:8000/login/{base_user.department.dept_name}"
                })

            # Verify the password
            if check_password(password, base_user.password):
                # Set basic session variables
                request.session['user_id'] = base_user.user_id
                request.session['user_name'] = base_user.full_name
                request.session['user_designation'] = ''

                # Redirect to dashboard on successful login
                logger.debug(f"Login successful for {username}, redirecting to dashboard")
                return redirect('dashboard', dept_name=dept_name)
            else:
                logger.debug(f"Password mismatch for {username}")
                return render(request, 'login.html', {
                    'department': department,
                    'error': 'Invalid username or password'
                })
        except Exception as e:
            logger.debug(f"Error during login for {username}: {str(e)}")
            return render(request, 'login.html', {
                'department': department,
                'error': 'Invalid username or password'
            })
    
    return render(request, 'login.html', {'department': department})

def dashboard(request, dept_name):
    department = get_object_or_404(Department, dept_name=dept_name)

    # Check if user is logged in
    user_id = request.session.get('user_id')
    if not user_id:
        return redirect('login', dept_name=dept_name)

    try:
        user = User_header_all.objects.get(user_id=user_id, status=1)
        if user.department.dept_name != dept_name:
            return redirect('login', dept_name=user.department.dept_name)
    except User_header_all.DoesNotExist:
        return redirect('login', dept_name=dept_name)

    # Fetch projects belonging to the user's department
    projects = Project.objects.filter(department=department).order_by('project_name')

    # Ip Camera
    # cameras = CameraGroupDetailsAll.objects.all()


    return render(request, 'dashboard.html', {
        'department': department,
        'user_name': request.session.get('user_name', 'Guest'),
        'projects': projects,  # Pass projects to the template
        # 'cameras': cameras
    })
    
def project_detail(request, dept_name, project_id):
    department = get_object_or_404(Department, dept_name=dept_name)
    current_project = get_object_or_404(Project, project_id=project_id, department=department)
    projects = Project.objects.filter(department=department)

    ipproject = get_object_or_404(Project, project_id='PRO-00001')
    print("Project ID :::",project_id)
    print("IP Project ID :::",ipproject)
    cameras = CameraGroupDetailsAll.objects.filter(project=ipproject).values('camera_id', 'location_name', 'ip_link', 'status')

    # from .streaming import start_ffmpeg_stream
    # start_ffmpeg_stream()

    context = {
        'department': department,
        'current_project': current_project,
        'projects': projects,
        'user_name': request.session.get('user_name'),
        'project_selected': True,
        'cameras': list(cameras)
    }
    return render(request, 'dashboard.html', context)

@xframe_options_exempt
def msrdc_map(request):
    # Get coordinates
    # coordinates = KmGpsCoordinateDetailsAll.objects.all().values('kgcd_km', 'kgcd_start_gps', 'kgcd_end_gps')
    # coordinates_list = [
    #     {
    #         'kgcd_km': item['kgcd_km'] or '',
    #         'kgcd_start_gps': item['kgcd_start_gps'] or '',
    #         'kgcd_end_gps': item['kgcd_end_gps'] or ''
    #     }
    #     # for item in coordinates
    # ]

    # Get all cameras
    ipproject = get_object_or_404(Project, project_id='PRO-00001')

    camera_groups = CameraGroupHeaderAll.objects.filter(project=ipproject).values(
        'cagh_id', 'cagh_group_name', 'cagh_type'
    )

    # Get all cameras with their associated group
    cameras = CameraGroupDetailsAll.objects.filter(project=ipproject).values(
        'camera_id', 'location_name', 'ip_link', 'status', 'camera_group__cagh_id'
    )

    return render(request, 'MSRDC.html', {
        'camera_groups': list(camera_groups),
        'cameras': list(cameras)
    })

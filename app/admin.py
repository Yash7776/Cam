from django.contrib import admin
from .models import Department,Profile_header_all,UniqueIdHeaderAll,CameraGroupDetailsAll,User_header_all, Project,CameraGroupHeaderAll

admin.site.register(Department)
admin.site.register(User_header_all)
admin.site.register(UniqueIdHeaderAll)
admin.site.register(Profile_header_all)
admin.site.register(Project)
admin.site.register(CameraGroupDetailsAll)
admin.site.register(CameraGroupHeaderAll)
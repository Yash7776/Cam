from django.urls import path
from .import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('login/<str:dept_name>', views.login, name="login"),
    path('dashboard/<str:dept_name>', views.dashboard, name="dashboard"),
   path('<str:dept_name>/<str:project_id>/', views.project_detail, name='project_detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
import sys
from django.apps import AppConfig


class AppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app'

    def ready(self):
        # Avoid running during migrations, shell, etc.
        if 'runserver' in sys.argv:
            from .streaming import start_ffmpeg_stream
            start_ffmpeg_stream()

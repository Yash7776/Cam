import subprocess
import threading
import os
from django.utils import timezone
from app.models import Project_ip_camera_details_all

def start_ffmpeg_stream():
    ffmpeg_path = "C:/ffmpeg-7.1.1-full_build/bin/ffmpeg.exe"
    media_dir = "D:\Tejas\Project\media\stream"
    # Ensure media directory exists
    os.makedirs(media_dir, exist_ok=True)

    cameras = Project_ip_camera_details_all.objects.filter(status=1)

    for camera in cameras:
        print(camera.camera_id)
        stream_name = f'cam_{camera.camera_id}'
        rtsp_url = f"rtsp://{camera.user_name}:{camera.password}@{camera.ip_link}"
        output_path = os.path.join(media_dir, f"{stream_name}.m3u8")

        def run_ffmpeg(rtsp=rtsp_url, out=output_path, cam=camera):
            try:
                cmd = [
                    ffmpeg_path,
                    '-rtsp_transport', 'tcp',
                    '-i', rtsp,
                    '-c:v', 'libx264',
                    '-f', 'hls',
                    '-hls_time', '2',
                    '-hls_list_size', '5',
                    '-hls_flags', 'delete_segments',
                    out
                ]
                process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                stdout, stderr = process.communicate()
                if process.returncode != 0:
                    print(f"FFmpeg failed for camera {cam.camera_id}: {stderr.decode()}")
                    cam.status = 0
                    cam.last_connected = None
                    cam.save()
                else:
                    cam.status = 1
                    cam.last_connected = timezone.now()
                    cam.save()
            except Exception as e:
                print(f"Error streaming camera {cam.camera_id}: {str(e)}")
                cam.status = 0
                cam.last_connected = None
                cam.save()

        threading.Thread(target=run_ffmpeg, daemon=True).start()
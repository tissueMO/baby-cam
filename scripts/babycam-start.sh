#!/bin/bash

stream_host=$1

ffmpeg \
  -f v4l2 -thread_queue_size 8192 -framerate 30 -input_format h264 -video_size 1280x720 -i /dev/video0 \
  -c:v copy -r 30 -b:v 1500k \
  -f flv \
  -fflags +igndts \
  -nostdin \
  rtmp://$stream_host/live/stream

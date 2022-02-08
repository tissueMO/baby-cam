#!/bin/bash

num=`ps aux | grep ffmpeg | grep -v grep | wc -l`

if [ $num -gt 0 ]; then
  echo "Already running."
  exit
fi

ffmpeg \
  -f alsa -thread_queue_size 16384 -ac 1 -i $BABYCAM_AUDIO_SOURCE \
  -f v4l2 -thread_queue_size 4096  -input_format h264 -video_size $BABYCAM_VIDEO_SIZE -i $BABYCAM_VIDEO_SOURCE \
  -c:a aac -b:a 128k -ar 44100 -c:v copy \
  -f flv -nostdin -nostats \
  rtmp://$BABYCAM_STREAM_HOST/live/stream 2>&1

#!/bin/bash

interval=5
prev_count=0
stop_count=0
warmup_count=0

function print_log() {
  echo "[StreamWatch] `date "+%Y/%m/%d %H:%M:%S"` $1"
}
function send_stream_stopped() {
  curl -s -X POST http://${REBOOTER_HOST}/reboot
}

while true
do
  count=`ls -1 /dev/shm/live | wc -l`

  # 配信が止まっている場合は配信元へ対処を促し、一定時間重複して検知しないようにする
  if [ $count -eq 0 ] && [ $prev_count -ne 0 ] && [ $warmup_count -eq 0 ]; then
    print_log "配信停止を検知しました"
    send_stream_stopped
    warmup_count=1
  fi
  if [ $warmup_count -gt 0 ];
    warmup_count=$((++warmup_count))
  fi
  if [ $((warmup_count * interval)) -gt $REBOOTER_WARMUP ]; then
    print_log "ウォームアップ待機終了"
    warmup_count=0
  fi

  # 一定時間を超えて配信が止まり続けている場合は強制的に配信元へ対処を促す
  if [ $count -eq 0 ] && [ $prev_count -eq 0 ]; then
    stop_count=$((++stop_count))
  fi
  if [ $((stop_count * interval)) -ge $REBOOTER_TIMEOUT ]; then
    print_log "一定時間配信が行われていません"
    send_stream_stopped
    stop_count=0
  fi

  prev_count=$count

  sleep $interval
done

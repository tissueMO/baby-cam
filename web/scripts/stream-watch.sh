#!/bin/bash

prev_count=0

while true
do
  count=`ls -1 /dev/shm/live | wc -l`

  # 配信が止まっている場合は配信元のWebhookエンドポイントを叩いて対処を促す
  if [ $count -eq 0 ] && [ $prev_count -ne 0 ]; then
    echo "配信停止を検知しました"
    curl -X POST http://${REBOOTER_HOST}/reboot
  fi

  prev_count=$count

  sleep 5
done

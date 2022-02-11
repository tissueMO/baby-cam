#!/bin/bash

/usr/bin/stream-watch.sh &

nginx -g 'daemon off;'

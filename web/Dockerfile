FROM tiangolo/nginx-rtmp:latest

ENV STREAM_HOST localhost:3000

COPY scripts/stream-watch.sh /usr/bin/stream-watch.sh
COPY scripts/setup.sh /usr/bin/setup.sh
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/default.conf /etc/nginx/conf.d/default.conf
COPY contents /usr/share/nginx/html

RUN chmod +x /usr/bin/*.sh

EXPOSE 80
EXPOSE 1935

CMD ["/usr/bin/setup.sh"]

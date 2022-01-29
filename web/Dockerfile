FROM tiangolo/nginx-rtmp:latest

COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/default.conf /etc/nginx/conf.d/default.conf
COPY contents /usr/share/nginx/html

EXPOSE 80
EXPOSE 1935

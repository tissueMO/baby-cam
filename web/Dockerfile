FROM tiangolo/nginx-rtmp:latest AS dev

ENV REBOOTER_HOST rebooter:3000
ENV APP_HOST localhost:3000

# Node.js をインストール
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo 'deb https://dl.yarnpkg.com/debian/ stable main' | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y nodejs yarn

COPY scripts/stream-watch.sh /usr/bin/stream-watch.sh
COPY scripts/setup.sh /usr/bin/setup.sh
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/default.conf /etc/nginx/conf.d/default.conf

RUN chmod +x /usr/bin/*.sh

EXPOSE 80
EXPOSE 1935

WORKDIR /usr/share/nginx/src
COPY src .
RUN yarn
CMD [ "yarn", "dev" ]


FROM dev AS prod

WORKDIR /usr/share/nginx/src
RUN mkdir -p /usr/share/nginx/html/ \
  && yarn generate \
  && cp -R ./dist/* /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html
CMD ["/usr/bin/setup.sh"]

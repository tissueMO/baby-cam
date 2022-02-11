# 開発ステージ
FROM tiangolo/nginx-rtmp:latest AS dev

ENV REBOOTER_HOST rebooter:3000

# Node.js をインストール
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash \
  && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
  && echo 'deb https://dl.yarnpkg.com/debian/ stable main' | tee /etc/apt/sources.list.d/yarn.list \
  && apt-get update \
  && apt-get install -y nodejs yarn

COPY stream-watch.sh /usr/bin/
COPY setup.sh /usr/bin/
COPY nginx/nginx.conf /etc/nginx/
COPY nginx/default.conf /etc/nginx/conf.d/

RUN chmod +x /usr/bin/*.sh

EXPOSE 80
EXPOSE 1935

WORKDIR /usr/share/nginx/src
COPY src .
RUN yarn

CMD ["yarn", "dev"]

# 本番ステージ
FROM dev AS prod

ARG APP_HOST localhost:3000

WORKDIR /usr/share/nginx/src
RUN mkdir -p /usr/share/nginx/html/ \
  && yarn generate \
  && cp -R ./dist/* /usr/share/nginx/html/

WORKDIR /usr/share/nginx/html
CMD ["/usr/bin/setup.sh"]

FROM node:16-alpine

RUN apk add --update python3 make g++ libexecinfo-dev libexecinfo libasound2-dev \
  && rm -rf /var/cache/apk/*

# Raspberry Pi 向けに最新版のビルドしたモジュールを使用する
WORKDIR /usr/src/
RUN git clone https://git.assembla.com/portaudio.git \
  && cd portaudio \
  && ./configure \
  && make clean \
  && make

WORKDIR /usr/src/app
ADD src /usr/src/app
RUN yarn install

RUN cp /usr/src/portaudio/lib/.libs/libportaudio.so.2 /usr/src/app/node_modules/naudiodon/build/Release/

EXPOSE 3000

CMD ["yarn", "start"]

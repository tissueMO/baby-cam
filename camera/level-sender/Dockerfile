FROM node:16-alpine

ENV WEBSOCKET_HOST ws://app:3000/
ENV BABYCRY_AUDIO_SOURCE 1

WORKDIR /usr/src/app
ADD src /usr/src/app
RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]

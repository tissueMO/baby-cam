FROM node:16-alpine

ENV SWITCHBOT_API_TOKEN xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENV SWITCHBOT_METER_DEVICE_ID xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

WORKDIR /usr/src/app
ADD src /usr/src/app
RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]

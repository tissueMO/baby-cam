FROM node:16-alpine

ENV SWITCHBOT_API_TOKEN xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENV SWITCHBOT_METER_DEVICE_ID xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENV SLACK_WEBHOOK_URL https://hooks.slack.com/services/xxxxxxxxxxxxx/xxxxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxxxx
ENV CRY_NOTIFY_THRESHOLD 60
ENV TEMPERATURE_NOTIFY_LOWER_THRESHOLD 17.5
ENV TEMPERATURE_NOTIFY_HIGHER_THRESHOLD 25.0
ENV HUMIDITY_NOTIFY_LOWER_THRESHOLD 40
ENV HUMIDITY_NOTIFY_HIGHER_THRESHOLD 60

WORKDIR /usr/src/app
ADD src /usr/src/app
RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]

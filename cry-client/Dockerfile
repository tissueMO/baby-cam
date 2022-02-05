FROM node:16-alpine

RUN apk add --update python3 make g++ libexecinfo-dev libexecinfo \
  && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app
ADD src /usr/src/app
RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]

FROM node:16-alpine

WORKDIR /usr/src/app
ADD src /usr/src/app
RUN yarn install

EXPOSE 3000

CMD ["yarn", "start"]

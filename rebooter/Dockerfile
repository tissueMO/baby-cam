FROM mcr.microsoft.com/playwright:latest

ENV VIEWER_URL http://web

WORKDIR /usr/src/app

ADD src /usr/src/app
RUN yarn install

CMD bash -c "node index.js"

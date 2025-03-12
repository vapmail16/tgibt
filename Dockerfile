FROM node:20-alpine

ENV PORT 80

ENV NODE_ENV production

WORKDIR /app

ADD . /app

RUN ls -lah && pwd 

RUN npm install

ENTRYPOINT npm start

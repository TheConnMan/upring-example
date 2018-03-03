FROM node:8

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD node receive.js
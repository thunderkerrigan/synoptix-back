FROM node

WORKDIR /usr/src/app
COPY package*.json .
RUN apt-get -y update
RUN yarn --production
COPY ./dist .
COPY .env .env
EXPOSE 4000
WORKDIR /usr/src/app
CMD [ "node", "src/index.js" ]

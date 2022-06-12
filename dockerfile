FROM node

WORKDIR /usr/src/app
COPY package*.json .
RUN apt-get -y update
RUN yarn
RUN yarn prod
COPY ./src .
COPY ./frWiki_no_phrase_no_postag_700_cbow_cut100.bin .
COPY .env .env
EXPOSE 4000
WORKDIR /usr/src/app
CMD [ "node", "src/index.js" ]

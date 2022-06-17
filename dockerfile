FROM node

WORKDIR /usr/src/app
COPY package*.json .
RUN apt-get -y update
COPY ./tsconfig.json .
COPY ./src ./src
RUN yarn
RUN yarn prod
# COPY ./frWiki_no_phrase_no_postag_700_cbow_cut100.bin .
COPY ./frWac_non_lem_no_postag_no_phrase_200_skip_cut100.bin .
COPY .env .env
EXPOSE 4000
WORKDIR /usr/src/app
# CMD [ "node", "dist/src/index.js" ]
CMD [ "yarn", "dev" ]

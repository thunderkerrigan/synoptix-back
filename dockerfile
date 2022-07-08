FROM node:18

WORKDIR /usr/src/app
COPY package*.json .
RUN apt-get -y update
COPY ./tsconfig.json .
RUN yarn
COPY ./src ./src
COPY ./frWac_non_lem_no_postag_no_phrase_200_skip_cut100.bin .
COPY .env .env
RUN yarn tsc
EXPOSE 4000
CMD [ "yarn", "start"]

FROM node:9

WORKDIR /opt/services/frontend/
COPY package.json .
RUN yarn install \
    && yarn global add serve
COPY . .
RUN yarn build

EXPOSE 5000

CMD ["serve", "-s", "build/"]

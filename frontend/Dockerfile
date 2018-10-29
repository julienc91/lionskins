FROM node:9

RUN mkdir -p /opt/services/frontend/
WORKDIR /opt/services/frontend/
COPY . ./
RUN yarn install && yarn build && yarn global add serve
EXPOSE 5000
CMD ["serve", "-s", "build/"]

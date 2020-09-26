FROM node:14

WORKDIR /opt/services/frontend/
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]

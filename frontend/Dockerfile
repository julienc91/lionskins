FROM node:14

WORKDIR /opt/services/frontend/
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build \
    && ln -sf /data/shared/sitemap.xml public/ \
    && ln -sf /data/shared/players.json public/

EXPOSE 3000

CMD ["yarn", "start"]

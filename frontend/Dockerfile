FROM node:12

WORKDIR /opt/services/frontend/
COPY package.json .
RUN yarn install \
    && yarn global add serve
COPY . .
RUN yarn build \
    && ln -sf /data/shared/sitemap.xml build/ \
    && ln -sf /data/shared/players.json build/

EXPOSE 5000

CMD ["serve", "-s", "-S", "build/"]

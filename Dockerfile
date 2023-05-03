FROM node:16.14.0-alpine as builder

WORKDIR /code

ADD package.json pnpm-lock.yaml /code/

RUN npm config set registry http://registry.npm.taobao.org/

RUN npm install -g pnpm

RUN pnpm install

ADD . /code

RUN pnpm run build

FROM nginx:alpine
COPY --from=builder code/dist /usr/share/nginx/html

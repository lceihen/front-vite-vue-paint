FROM node:14-alpine as builder

WORKDIR /code

ADD package.json package-lock.json /code/

RUN npm config set registry http://registry.npm.taobao.org/

RUN npm install

ADD . /code

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder code/build /usr/share/nginx/html

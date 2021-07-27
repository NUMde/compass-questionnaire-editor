FROM node:12-alpine as builder

WORKDIR /build
ADD package.json .
RUN npm install
COPY . .


RUN npm run build

FROM nginx:1.13.12-alpine as production-stage
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

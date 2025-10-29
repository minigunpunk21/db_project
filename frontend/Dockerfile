# build-стейдж
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json ./
# COPY package-lock.json ./   # если есть — раскомментируй
RUN npm i

COPY . .
# если команда сборки у тебя иная — замени
RUN npm run build

# runtime: лёгкий nginx
FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx-light ca-certificates \
 && rm -rf /var/lib/apt/lists/*

RUN rm -f /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/ /var/www/html/

EXPOSE 80
STOPSIGNAL SIGTERM
CMD ["nginx","-g","daemon off;"]

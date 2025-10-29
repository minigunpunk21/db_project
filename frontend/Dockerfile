# --- build ---
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1) только манифесты
COPY package*.json ./

# 2) ставим зависимости проекта
#    + подсовываем rollup wasm (без записи в package.json)
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi \
 && npm i -D --no-save @rollup/wasm-node

# 3) остальной код
COPY . .

# 4) говорим rollup использовать wasm-движок
ENV ROLLUP_WASM=1

# 5) сборка
RUN npm run build

# --- runtime ---
FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx-light ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN rm -f /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /var/www/html/
EXPOSE 80
CMD ["nginx","-g","daemon off;"]

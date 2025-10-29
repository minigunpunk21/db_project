# --- build ---
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1) только манифесты → установка dev-зависимостей (vite входит сюда)
COPY package*.json ./
# если есть lock: оставьте npm ci, иначе используйте npm i
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi

# 2) остальной код
COPY . .

# сборка
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

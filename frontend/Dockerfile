# --- build ---
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1) только манифесты
COPY package*.json ./

# 2) Пинним совместимые версии для 32-битной сборки:
#    - vite 4.x (работает с rollup 3)
#    - rollup 3.x (JS-реализация, без нативных бинарей)
RUN npm pkg set "devDependencies.vite"="4.5.3" \
 && npm pkg set "devDependencies.rollup"="3.29.4" \
 && if [ -f package-lock.json ]; then npm ci; else npm i; fi

# 3) остальной код
COPY . .

# 4) стандартная сборка
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

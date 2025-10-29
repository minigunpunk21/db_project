# --- build ---
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1) кладём только манифесты
COPY package.json ./
# если есть tsconfig, vite.config.* – скопируются на шаге ниже

# 2) пиним версии, совместимые с 32-битной сборкой
RUN npm pkg set devDependencies.vite=4.5.3 \
 && npm pkg set devDependencies.rollup=3.29.4 \
 && npm pkg set devDependencies.esbuild=0.18.20

# 3) ставим зависимости (генерируем новый lock внутри контейнера)
RUN npm install

# 4) кладём остальной код
COPY . .

# 5) билд фронта
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

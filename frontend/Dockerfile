# --- build (совместимо с linux/ia32) ---
FROM debian:bookworm-slim AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 1) только манифесты
COPY package.json ./
# не копируем lock с хоста, чтобы не конфликтовал на понижении версий

# 2) пин версий, совместимых с 32-битной сборкой Vite
RUN npm pkg set devDependencies.vite=4.5.3 \
 && npm pkg set devDependencies.rollup=3.29.4 \
 && npm pkg set devDependencies.esbuild=0.18.20 \
 && npm install

# 3) остальной код
COPY . .

# 4) API-урл подставляем на этапе сборки
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# 5) билд
RUN npm run build

# --- runtime (отдаём статику) ---
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

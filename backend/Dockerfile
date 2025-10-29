FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates tini \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

# зависимости отдельно — кеш
COPY package.json ./
# если есть lock — раскомментируйте:
# COPY package-lock.json ./
RUN npm i --omit=dev

# исходники
COPY src ./src

ENV PORT=3001
EXPOSE 3001

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","src/server.js"]   # поменяйте, если у вас другой entrypoint

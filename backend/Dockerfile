FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends nodejs npm ca-certificates tini \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
# COPY package-lock.json ./   # если есть — раскомментируй
RUN npm i --omit=dev

COPY src ./src

ENV PORT=3001
EXPOSE 3001

ENTRYPOINT ["/usr/bin/tini","--"]
CMD ["node","src/server.js"]   # поменяй, если у тебя другой entrypoint

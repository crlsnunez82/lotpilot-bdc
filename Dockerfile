# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN chmod +x docker/start-app.sh docker/start-worker.sh

EXPOSE 3000

CMD ["./docker/start-app.sh"]

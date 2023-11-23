FROM node:slim AS builder

RUN apt update -y  \
    && apt upgrade -y  \
    && apt install -y openssl git openssh-server curl unzip

RUN curl -fsSL https://bun.sh/install | bash && ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY ./nx.json ./package* ./tsconfig* ./.eslintrc.json ./
COPY ./tools ./tools
COPY ./prisma ./prisma

COPY ./libs ./libs
COPY ./apps ./apps

RUN --mount=type=ssh bun i --no-save


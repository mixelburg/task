FROM 706752423248.dkr.ecr.us-east-1.amazonaws.com/tasks-base as builder

WORKDIR /app
COPY . apps/backend/

RUN --mount=type=ssh npx nx build backend

FROM 706752423248.dkr.ecr.us-east-1.amazonaws.com/tasks-runner as runner

WORKDIR /app
COPY --from=builder /app/dist/apps/backend .

ENTRYPOINT ["node", "./main.js"]

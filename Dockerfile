FROM node:18-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate && pnpm prisma migrate deploy

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

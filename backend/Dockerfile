FROM node:22-alpine

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lms?schema=public"

RUN npx prisma generate --schema=./prisma/schema.prisma

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]

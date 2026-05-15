# Build stage
FROM node:22-alpine AS builder

# Installation des dépendances système nécessaires pour Prisma 7 sur Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Déclaration des ARGs pour éviter les warnings Coolify
ARG JWT_SECRET
ARG JWT_EXPIRES_IN
ARG DATABASE_URL

# On définit la DATABASE_URL fictive pour la phase de build (Validation Prisma)
# Note : Cette valeur est écrasée par Coolify au moment du RUNTIME.
ENV DATABASE_URL=${DATABASE_URL:-"postgresql://user:password@localhost:5432/dummy"}

# Installation des dépendances Node
COPY package*.json ./
RUN npm install

# Copie des fichiers de configuration et du dossier prisma
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Génération du client Prisma
RUN npx prisma generate --schema=prisma/schema.prisma

# Copie du reste du code source et build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

# On rajoute les libs système pour le runtime aussi
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Récupération des fichiers nécessaires
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

RUN chmod +x ./start.sh

EXPOSE 3000

CMD ["./start.sh"]

# Build stage
FROM node:22-alpine AS builder

# Installation des dépendances système nécessaires pour Prisma 7 sur Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Installation des dépendances Node
COPY package*.json ./
RUN npm install

# Copie des fichiers de configuration et du dossier prisma
COPY prisma ./prisma/
COPY prisma.config.ts ./

# On définit une DATABASE_URL fictive UNIQUEMENT pour la phase de build.
# Cela permet à 'prisma generate' de valider le schéma sans avoir besoin d'une base réelle.
# Cette valeur sera ignorée au RUNTIME car Coolify injectera la vraie URL.
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dummy?schema=public"

# Génération du client Prisma
RUN npx prisma generate

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

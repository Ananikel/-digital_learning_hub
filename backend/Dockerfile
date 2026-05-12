# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# On copie les fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm install

# Copie du reste du code
COPY . .

# Génération de Prisma Client (nécessaire pour la compilation NestJS)
RUN npx prisma generate

# Build de l'application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# On copie les fichiers nécessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

# On s'assure que le script est exécutable
RUN chmod +x ./start.sh

EXPOSE 3000

# On lance le script de démarrage qui gèrera Prisma et l'App au RUNTIME
CMD ["./start.sh"]

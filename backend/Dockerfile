# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# On installe les dépendances en premier pour optimiser le cache Docker
COPY package*.json ./
RUN npm install

# On copie le dossier prisma
COPY prisma ./prisma/

# On définit la DATABASE_URL fictive pour la phase de build (Validation Prisma)
# Note : Cette valeur est écrasée par Coolify au moment du RUNTIME.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/dummy"

# Génération du client Prisma (Indispensable pour le build NestJS)
RUN npx prisma generate --schema=prisma/schema.prisma

# Copie du reste du code source
COPY . .

# Suppression du fichier config Prisma pour éviter les conflits au build
RUN rm -f prisma.config.ts

# Compilation de l'application NestJS
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# On ne récupère que le nécessaire pour l'exécution
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

# On s'assure que le script de démarrage est prêt
RUN chmod +x ./start.sh

EXPOSE 3000

# Coolify injectera la vraie DATABASE_URL ici
CMD ["./start.sh"]

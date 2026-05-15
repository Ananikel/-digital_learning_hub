# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# On définit la DATABASE_URL fictive pour la phase de build uniquement
# Cela permet à Prisma de valider le schéma et de générer le client.
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du dossier prisma pour la génération du client
COPY prisma ./prisma/

# Génération de Prisma Client
# On utilise --schema pour être explicite et on s'assure que DATABASE_URL est présente
RUN npx prisma generate --schema=prisma/schema.prisma

# Copie du reste du code source
COPY . .

# On s'assure qu'aucun fichier de config additionnel ne perturbe le build Alpine
RUN rm -f prisma.config.ts

# Build de l'application NestJS
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Récupération des fichiers compilés et des dépendances
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/start.sh ./start.sh

# Permission pour le script de démarrage
RUN chmod +x ./start.sh

EXPOSE 3000

# Le runtime utilisera la vraie DATABASE_URL fournie par Coolify
CMD ["./start.sh"]

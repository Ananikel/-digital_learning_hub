#!/bin/sh

# On attend que la DB soit prête si nécessaire (optionnel car Coolify gère souvent ça)
echo "🚀 Démarrage de l'initialisation du backend..."

# Génération du client Prisma (basé sur le schéma)
echo "📦 Génération du client Prisma..."
npx prisma generate

# Application des migrations (création des tables)
echo "🗄️ Application des migrations..."
npx prisma migrate deploy

# Remplissage des données initiales (Seed)
# Note : On peut commenter cette ligne si on ne veut pas seed à chaque redémarrage
echo "🌱 Remplissage de la base de données (Seed)..."
npx prisma db seed

# Démarrage de l'application NestJS
echo "✨ Lancement de l'application..."
npm run start:prod

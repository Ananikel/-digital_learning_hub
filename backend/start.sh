#!/bin/sh

echo "🚀 Démarrage de l'initialisation du backend..."

# Création d'un fichier .env à la volée pour Prisma
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL=\"$DATABASE_URL\"" > .env
  echo "✅ Fichier .env généré avec l'URL de la base de données."
else
  echo "⚠️ Attention : DATABASE_URL est vide."
fi

# Génération du client Prisma
echo "📦 Génération du client Prisma..."
npx prisma generate

# Application des migrations
echo "🗄️ Application des migrations..."
npx prisma migrate deploy

# Remplissage des données initiales (Seed)
# On utilise ts-node avec des options pour forcer la lecture du .ts
echo "🌱 Remplissage de la base de données (Seed)..."
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# Démarrage de l'application NestJS
echo "✨ Lancement de l'application..."
npm run start:prod

#!/bin/sh

echo "🚀 Démarrage de l'initialisation du backend..."

# Vérification de la présence de DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERREUR : La variable DATABASE_URL est absente !"
  # On ne s'arrête pas forcément, on laisse NestJS essayer de démarrer
else
  echo "✅ DATABASE_URL détectée."
fi

# Génération du client Prisma
echo "📦 Génération du client Prisma..."
npx prisma generate

# Application des migrations (on force l'URL si elle existe pour être sûr)
echo "🗄️ Application des migrations..."
npx prisma migrate deploy

# Remplissage des données initiales (Seed)
echo "🌱 Remplissage de la base de données (Seed)..."
npx prisma db seed

# Démarrage de l'application NestJS
echo "✨ Lancement de l'application..."
npm run start:prod

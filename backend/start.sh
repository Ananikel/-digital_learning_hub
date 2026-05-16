#!/bin/sh

# On arrête le script au premier échec
set -e

echo "🚀 Démarrage de l'initialisation du backend..."

# Utilisation de la variable DATABASE_URL fournie par l'environnement (Coolify ou Docker)
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERREUR : La variable DATABASE_URL est vide."
  exit 1
fi

# Création du .env pour les outils CLI de Prisma
echo "DATABASE_URL=\"$DATABASE_URL\"" > .env
echo "✅ Fichier .env généré."

# Attente de la disponibilité de la base de données (optionnel mais recommandé)
# Ici on fait une tentative simple avec npx prisma db pull ou similaire
echo "⏳ Vérification de la connexion à la base de données..."
MAX_RETRIES=5
COUNT=0
until npx prisma db push --accept-data-loss > /dev/null 2>&1 || [ $COUNT -eq $MAX_RETRIES ]; do
  echo "🔄 Attente de la base de données... ($((COUNT+1))/$MAX_RETRIES)"
  sleep 5
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Impossible de se connecter à la base de données après $MAX_RETRIES tentatives."
  exit 1
fi

echo "✅ Base de données prête et schéma synchronisé."

# Remplissage des données initiales (Seed)
echo "🌱 Remplissage de la base de données (Seed)..."
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

# Démarrage de l'application NestJS
echo "✨ Lancement de l'application..."
npm run start:prod

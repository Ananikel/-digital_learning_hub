# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Définition de l'URL de l'API pour le build (Vite injecte ça dans le code)
ARG VITE_API_URL=https://digitallearning-hub.kelensitech.cloud
ENV VITE_API_URL=$VITE_API_URL

# Build de l'application
RUN npm run build

# Production stage (serveur léger Nginx)
FROM nginx:stable-alpine

# Copie des fichiers buildés depuis le builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration Nginx pour gérer le Single Page Application (React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

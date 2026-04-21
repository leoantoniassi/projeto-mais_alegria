# ---- Build Stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Production Stage (Nginx) ----
FROM nginx:alpine

# Copia o build do React para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Config do Nginx com proxy reverso para o backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

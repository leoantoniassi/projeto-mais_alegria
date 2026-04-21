FROM node:18-alpine

WORKDIR /app

# Copia package files e instala dependências
COPY package*.json ./
RUN npm ci --only=production

# Copia o código fonte
COPY . .

# Cria diretório de uploads
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "src/server.js"]

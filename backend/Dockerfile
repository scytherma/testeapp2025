# Dockerfile para o Backend Node.js
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Expor porta
EXPOSE 3001

# Definir usuário não-root
USER node

# Comando para iniciar a aplicação
CMD ["npm", "start"]

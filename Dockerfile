# Use Node base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy rest of project
COPY . .

# Build project
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["sh", "-c", "npx prisma db push && npm start"]
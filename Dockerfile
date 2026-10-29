FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and package files
COPY package.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server dependencies & generate Prisma
WORKDIR /app/server
RUN npm install
COPY server/prisma ./prisma
RUN npx prisma generate

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy source code
WORKDIR /app
COPY server ./server
COPY client ./client

# Build client and server
RUN cd client && npm run build
RUN cd server && npm run build

# Production Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001
ENV DATABASE_URL="file:/app/data/insurance.db"
ENV JWT_SECRET="tailvar_production_secret_key_2026_durable"

# Create directory for persistent SQLite database
RUN mkdir -p /app/data

COPY package.json ./
COPY server/package*.json ./server/

WORKDIR /app/server
RUN npm install --omit=dev

COPY server/prisma ./prisma
RUN npx prisma generate
RUN npx prisma db push

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/client/dist /app/client/dist

EXPOSE 5001

CMD ["node", "dist/index.js"]

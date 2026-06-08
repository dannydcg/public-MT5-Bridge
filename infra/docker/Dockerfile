FROM node:20-alpine
WORKDIR /workspace/apps/backend
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/package.json
RUN npm install
COPY . .
WORKDIR /workspace/apps/backend
CMD ["npm", "run", "dev"]

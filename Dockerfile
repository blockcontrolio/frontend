# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package.json ./
COPY index.html ./
COPY vite.config.js ./
COPY src ./src

ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm install && npm run build

# Production stage
FROM nginx:alpine

# Copy built frontend assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

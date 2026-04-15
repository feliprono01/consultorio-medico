# ─────────────────────────────────────────────
# STAGE 1: Build — compila React con Node
# ─────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos package.json primero para cache de dependencias
COPY package*.json ./
RUN npm ci

# Copiamos el código y compilamos
# VITE_API_URL=/api usa el proxy nginx en Docker (en lugar de http://localhost:8080)
COPY . .
RUN VITE_API_URL=/api npm run build

# ─────────────────────────────────────────────
# STAGE 2: Serve — nginx sirve los archivos estáticos
# ─────────────────────────────────────────────
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Eliminamos la config por defecto de nginx
RUN rm -rf ./*

# Copiamos el build de React
COPY --from=build /app/dist .

# Copiamos nuestra config de nginx (maneja el routing de React SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ---------- Stage 1: build React app ----------
FROM node:20-alpine AS build
WORKDIR /app

# Встановлюємо залежності (без package-lock.json)
COPY package.json ./
RUN npm install --legacy-peer-deps

# Копіюємо весь код і збираємо Vite
COPY . .
RUN npm run build

# ---------- Stage 2: serve через Nginx ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

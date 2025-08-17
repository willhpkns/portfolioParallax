# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   # produces ./dist

# --- runtime (serve static on port 8080) ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# make nginx listen on 8080 (Caddy proxies to this)
RUN sed -i 's/listen\s\+80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080

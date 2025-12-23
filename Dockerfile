# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Skip postinstall that references non-existent folders
RUN npm ci --ignore-scripts
COPY . .
# Your root "build" runs the frontend build under ./project
RUN npm run build   # produces ./project/dist

# --- runtime (serve static on 8080) ---
FROM nginx:1.27-alpine
# Copy the built site from the correct path
COPY --from=build /app/project/dist /usr/share/nginx/html
# Make nginx listen on 8080 (internal port - Coolify's Caddy handles 80/443)
RUN printf 'server {\n\
  listen 8080;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  include /etc/nginx/mime.types;\n\
  gzip on;\n\
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { expires 1y; add_header Cache-Control "public, immutable"; }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

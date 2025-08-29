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
# Make nginx listen on 8080 and add SPA fallback
RUN printf 'server {\n  listen 8080;\n  root /usr/share/nginx/html;\n  include /etc/nginx/mime.types;\n  location / { try_files $uri /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 8080

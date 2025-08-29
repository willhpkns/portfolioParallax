# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# skip postinstall that references non-existent folders
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build   # produces ./dist

# --- runtime ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN sed -i 's/listen\s\+80;/listen 8080;/' /etc/nginx/conf.d/default.conf
EXPOSE 8080

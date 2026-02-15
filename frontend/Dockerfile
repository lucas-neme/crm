# Build Stage
FROM node:20-alpine as build-stage

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . .

# Build the application
# We need to set the API URL to /api so it uses the relative path (proxied by Nginx)
ENV VITE_API_URL=/api
RUN pnpm run build

# Production Stage
FROM nginx:stable-alpine as production-stage

ARG BACKEND_UPSTREAM=backend:3000
RUN apk add --no-cache gettext

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf.template /tmp/nginx.conf.template
RUN env BACKEND_UPSTREAM=$BACKEND_UPSTREAM envsubst '$BACKEND_UPSTREAM' < /tmp/nginx.conf.template > /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

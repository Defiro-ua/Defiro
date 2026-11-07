# Frontend da defiro: compila a app com Node e serve os ficheiros estáticos com nginx.

# 1 · Compilar
FROM node:22-alpine AS build
WORKDIR /app
# As dependências primeiro, para o Docker reaproveitar esta camada enquanto o package-lock.json não mudar
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 2 · Servir
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

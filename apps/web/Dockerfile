# Frontend da defiro: compila a app com Node e serve os ficheiros estáticos com nginx.

# 1 · Compilar
FROM node:26-alpine AS build
WORKDIR /app
# As dependências primeiro, para o Docker reaproveitar esta camada enquanto o package-lock.json não mudar
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 2 · Servir
FROM nginx:1.29-alpine
# O endereço do servidor; em staging, o do serviço do servidor
ENV DEFIRO_SERVER=http://host.docker.internal:8080
# Um template: o nginx substitui ${DEFIRO_SERVER} ao arrancar e grava-o em conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

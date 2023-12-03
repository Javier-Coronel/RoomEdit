FROM node:18.13 AS build

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todos los archivos al directorio de trabajo
COPY . .
RUN npm install -g @angular/cli@latest
# Compila la aplicación Angular
RUN ng build

# Usa Nginx como servidor web ligero para servir la aplicación
FROM nginx:alpine

# Copia los archivos generados en la etapa de construcción al directorio correcto de Nginx
COPY --from=build /app/dist/* /usr/share/nginx/html/
COPY default.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80 para que la aplicación Angular pueda ser accedida
EXPOSE 80

# Comando para iniciar Nginx y servir la aplicación Angular
CMD ["nginx", "-g", "daemon off;"]
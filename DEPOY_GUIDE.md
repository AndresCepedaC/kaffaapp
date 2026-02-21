# Guía de Despliegue: Kaffa App

He preparado todo el código para que funcione en la web. Ahora necesitamos realizar los siguientes pasos manuales:

## 1. Subir el código a GitHub
1. Crea un nuevo repositorio en GitHub (puedes llamarlo `kaffaapp`).
2. Sube todo el contenido de este proyecto a ese repositorio.

## 2. Base de Datos (Neon.tech)
1. Regístrate en [Neon.tech](https://neon.tech) (gratis).
2. Crea un proyecto y copia la **Connection String** de PostgreSQL.
3. Tendrás algo como: `postgres://usuario:password@host/dbname`.

## 3. Servidor Backend (Render.com)
1. Regístrate en [Render.com](https://render.com).
2. Crea un nuevo **Web Service** y conéctalo a tu repo de GitHub.
3. **Root Directory**: `kaffaadvance/kaffa-server/kaffa-server`
4. **Runtime**: `Docker`
5. **Variables de Entorno (Environment Variables)**:
   - `JDBC_DATABASE_URL`: `jdbc:postgresql://host:5432/dbname?sslmode=require` (usa los datos de Neon pero con formato jdbc)
   - `JDBC_DATABASE_USERNAME`: tu usuario de Neon
   - `JDBC_DATABASE_PASSWORD`: tu password de Neon
   - `JDBC_DATABASE_DRIVER`: `org.postgresql.Driver`

## 4. Interfaz Frontend (Vercel.com)
1. Regístrate en [Vercel.com](https://vercel.com).
2. Importa tu repositorio de GitHub.
3. **Root Directory**: `kaffa-client`
4. **Framework Preset**: `Vite`
5. **Environment Variables**:
   - `VITE_API_URL`: La URL que te de Render (ej: `https://kaffa-server.onrender.com`)

---
**¿Deseas que te ayude a crear los comandos de Git para subir el código a GitHub primero?**

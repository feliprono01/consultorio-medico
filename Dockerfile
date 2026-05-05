# ─────────────────────────────────────────────
# STAGE 1: Build — compila el JAR con Maven
# ─────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos el pom.xml primero para aprovechar el cache de capas
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiamos el código fuente y compilamos
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─────────────────────────────────────────────
# STAGE 2: Run — imagen mínima solo con el JAR
# ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Instalar mysql-client para que mysqldump esté disponible en el contenedor
RUN apk add --no-cache mysql-client

# Crear directorio de backups (mapeado al volumen en docker-compose)
RUN mkdir -p /app/backups

# Copiamos solo el JAR del stage anterior
COPY --from=build /app/target/*.jar app.jar

# Puerto que expone Spring Boot
EXPOSE 8080

# Las variables de entorno sensibles (JWT_SECRET, passwords) se inyectan
# exclusivamente desde docker-compose o el servidor. No van hardcodeadas aquí.
ENTRYPOINT ["java", "-jar", "app.jar"]

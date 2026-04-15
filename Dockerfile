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

# Copiamos solo el JAR del stage anterior
COPY --from=build /app/target/*.jar app.jar

# Puerto que expone Spring Boot
EXPOSE 8080

# Variables de entorno con valores por defecto (sobreescribibles en docker-compose)
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/consultorio_medico?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root
ENV JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
ENV JWT_EXPIRATION=86400000

ENTRYPOINT ["java", "-jar", "app.jar"]

# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
COPY --from=build /target/kaffa-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Render provides the port in the $PORT environment variable
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=${PORT:8080}"]

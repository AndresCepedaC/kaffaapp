# ══════════════════════════════════════════════════════════════
# Kaffa Server - Multi-Stage Docker Build
# ══════════════════════════════════════════════════════════════

# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache dependencies layer (only re-download when pom.xml changes)
COPY pom.xml .
COPY .mvn .mvn
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B \
    && mv target/kaffa-server-0.0.1-SNAPSHOT.jar target/app.jar

# ─── Stage 2: Runtime ────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S kaffa && adduser -S kaffa -G kaffa

# Copy only the built JAR
COPY --from=build /app/target/app.jar app.jar

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R kaffa:kaffa /app

USER kaffa

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 1

EXPOSE ${PORT:-8080}

# Use exec form for proper signal handling
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]

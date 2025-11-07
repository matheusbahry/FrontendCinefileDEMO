# Multi-stage Dockerfile for Cinefile backend (Render/Koyeb/Railway)

FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests=true clean package

FROM eclipse-temurin:17-jre
WORKDIR /app
ENV JAVA_OPTS=""
ENV PORT=8080
COPY --from=build /app/target/cinefile-backend-0.1.0.jar /app/app.jar
EXPOSE 8080
CMD ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]


#
# Build stage
#
FROM maven:3.8.3-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

#
# Package stage
#
FROM eclipse-temurin:17-jre
COPY --from=build /target/unihub-0.0.1-SNAPSHOT.jar unihub.jar
EXPOSE 8080
ENTRYPOINT ["java","-Dserver.port=${PORT:8080}","-jar","unihub.jar"]

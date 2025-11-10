FROM eclipse-temurin:17-jdkF
COPY target/cxbox-demo-exec.jar /app/cxbox-demo.jar
WORKDIR /app
ENTRYPOINT ["java", "-jar", "cxbox-demo.jar"]
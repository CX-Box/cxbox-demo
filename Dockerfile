FROM openjdk:17
COPY target/cxbox-demo-exec.jar /app/cxbox-demo.jar
WORKDIR /app
ENTRYPOINT ["java", "-jar", "cxbox-demo.jar"]
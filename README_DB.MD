### Postgres:
see [README.md](README.md)

### Oracle:
* replace `<artifactId>postgresql</artifactId>` with oracle dependency in POM.xml
```xml
<dependency>
  <groupId>com.oracle.database.jdbc</groupId>
  <artifactId>ojdbc10</artifactId>
  <version>19.21.0.0</version>
</dependency>
```

* start environment

```bash
docker-compose -f docker-compose-oracle.yml up -d
```

* run application

```
start run configuration in Application_oracle
```

* (Optionally) alternatively run application in a way you like with following environment variables: 
```
DATABASE_DRIVER=oracle.jdbc.driver.OracleDriver;
DATABASE_URL=jdbc:oracle:thin:@localhost:1523/XEPDB1;
DATABASE_USER=app
DATABASE_PASSWORD=app;
```
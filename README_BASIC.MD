### Keycloak:
##### 1 Frontend configuration
build frontend with script from `ui/package.json`
```
build-noKeycloak
```
(instead of `build` script, that builds with keycloak sso enabled)

start frontend with script from `ui/package.json`
```
start-noKeycloak
```
(instead of `start` script, that builds with keycloak sso enabled)

##### 2 Backend configuration
Add user that will be available for basic auth in
 `src/main/resources/db/data/CXBOX-USERS.csv`

and add ther roles in  `src/main/resources/db/data/CXBOX-USER_ROLE.csv`

##### 3 Login process
type login/password (vanilla/vanilla is available by default)
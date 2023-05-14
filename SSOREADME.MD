### Keycloack:
##### 1 Frontend configuration
`ui/src/keycloak/index.ts`

`ui/public/keycloak.json`
  
For more details about this options see [docs](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)

##### 2 Backend configuration

 `src/main/resources/application.yaml -> keycloak:`

For more details about this options see [docs](https://www.keycloak.org/docs/latest/securing_apps/#_spring_boot_adapter)

##### 3 Adding new user
1) We use `use-resource-role-mappings: true` in `application.yml`, so roles must be added at "client" level. To add new role go to Configure -> Clients, then drill-down in "cxbox-keycloak-client", select tab "Roles" and press "Add role"
2) Create user [docs](https://www.keycloak.org/docs/latest/getting_started/#creating-a-realm-and-a-user)
3) In "Client Roles" select "cxbox-keycloak-client" and add at least one role  [docs](https://wjw465150.gitbooks.io/keycloak-documentation/content/server_admin/topics/roles/user-role-mappings.html)
4) Add new roles in dictionary, e.g. add them in CXBOX-DICTIONARY_ITEM.csv. For example, if you added role "NEW_ROLE", then csv will have this line:
```
ID;DICTIONARY_TYPE_ID;TYPE;KEY;VALUE;ACTIVE;DISPLAY_ORDER;DESCRIPTION
"100";1;"INTERNAL_ROLE";"NEW_ROLE";"New Role";true;0;null
```

##### 4 Saving keycloak configuration changes to git (realm, client, users and so on)
Keycloak in docker-compose.yml is configured to import configuration from `/docker/keycloak-config` on container startup using `keycloak.migration.action=import` [docs](https://access.redhat.com/documentation/en-us/red_hat_single_sign-on/7.0/html/server_administration_guide/export_import)

By default, in will not override changes made in UI on container restart, because `keycloak.migration.strategy=IGNORE_EXISTING` is used [docs](https://access.redhat.com/documentation/en-us/red_hat_single_sign-on/7.0/html/server_administration_guide/export_import)

To save changes made in UI to git one can change `keycloak.migration.action=import` to
`keycloak.migration.action=export` in docker-compose.yml
and delete and start new container. All changes will be present in /docker/keycloak-config. Please, do not forget to set `keycloak.migration.action=import` back

##### 5 Clean keycloak start
delete `.tmp` folder, then delete and start keycloack container

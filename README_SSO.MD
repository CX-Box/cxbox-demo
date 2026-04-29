### Keycloak:
##### 1 Frontend configuration
`ui/src/auth/index.ts`

For more details about this options see [docs](https://authts.github.io/oidc-client-ts/)

##### 2 Backend configuration

`src/main/resources/application.yaml -> oidc:`

Required parameters:

```
app:
  oidc:
    client_id: ${CLIENT_ID}
    scope: ${SCOPE}
    authority: ${AUTH_SERVER_URL}
```
If redirect_uri is not provided, it is taken from the URL the user opened in the application. Otherwise, the provided value is used.
For more details about this options see [docs](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest).


##### 3 Adding new user
1) We use `use-resource-role-mappings: true` in `application.yml`, so roles must be added at "client" level. To add new role go to Configure -> Clients, then drill-down in "cxbox-oidc-client", select tab "Roles" and press "Add role"
2) Create user [docs](https://www.keycloak.org/docs/latest/getting_started/#creating-a-realm-and-a-user)
3) In "Client Roles" select "cxbox-oidc-client" and add at least one role  [docs](https://wjw465150.gitbooks.io/keycloak-documentation/content/server_admin/topics/roles/user-role-mappings.html)
4) Add new roles in dictionary, e.g. add them in DICTIONARY.csv. For example, if you added role "NEW_ROLE", then csv will have this line:
```
TYPE;KEY;VALUE;DISPLAY_ORDER;DESCRIPTION;ACTIVE;ID
INTERNAL_ROLE;NEW_ROLE;New Role;0;;true;
```

##### 4 Saving keycloak configuration changes to git (realm, client, users and so on)
Keycloak in docker-compose.yml is configured to import configuration from `/docker/keycloak-config` on container startup using `--import-realm` [docs](https://www.keycloak.org/server/importExport#_importing_a_realm_during_startup)

By default, if a realm already exists in the server, the import operation is skipped. [docs](https://www.keycloak.org/server/importExport#_importing_a_realm_during_startup)

To save changes made in UI to git one can change `command: start-dev --import-realm --features=scripts` to `command: export --dir /opt/keycloak/data/import/ --users same_file` and recreate container. This command run export and after down container.
All changes will be present in /docker/keycloak-config. **Important**, do not forget to set `command: start-dev --import-realm --features=scripts` back

##### 5 Clean keycloak start
delete `.tmp` folder, then delete and start keycloak container

##### 6 Possible fix  
6.1 Fix: `HTTPS required` Error in Keycloak on mac

If you receive the **`HTTPS required`** error on local development

###### Option 1 (Recommended)

In Docker Desktop network configuration: **Settings → Resources → Network → Port binding behavior**  set to: 'Localhost by default'

[see discussions](https://github.com/quarkusio/quarkus/discussions/48905)

---

###### Option 2 (Not Recommended)

Disable SSL requirement in the realm. see the [official documentation](https://www.keycloak.org/docs/latest/server_admin/index.html#_ssl_modes)
Enter the Keycloak container `docker exec -it {keycloack_container} bash`
and run this command
```bash
cd /opt/keycloak/bin
./kcadm.sh config credentials \
  --server http://localhost:9080 \
  --realm master \
  --user ${admin_user}
  ./kcadm.sh update realms/{realmName} -s sslRequired=NONE
```
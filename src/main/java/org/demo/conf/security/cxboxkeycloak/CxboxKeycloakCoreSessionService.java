package org.demo.conf.security.cxboxkeycloak;

import java.util.stream.Collectors;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.core.util.session.CoreSessionServiceImpl;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.entity.AppUser;
import org.demo.entity.AppUser_;
import org.keycloak.adapters.springsecurity.account.SimpleKeycloakAccount;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Primary
@Component
public class CxboxKeycloakCoreSessionService extends CoreSessionServiceImpl {

	@Autowired
	private JpaDao jpaDao;

	@Autowired
	private TransactionService txService;

	@Override
	public CxboxUserDetailsInterface getAuthenticationDetails(Authentication auth) {
		if (auth == null) {
			return null;
		} else if (auth instanceof KeycloakAuthenticationToken) {
			KeycloakAuthenticationToken token = (KeycloakAuthenticationToken) auth;
			if (token.getDetails() instanceof CxboxKeycloakAccount) {
				return (CxboxKeycloakAccount) token.getDetails();
			} else {
				KeycloakAuthenticationToken accessToken = (KeycloakAuthenticationToken) auth;
				SimpleKeycloakAccount account = (SimpleKeycloakAccount) accessToken.getDetails();
				CxboxKeycloakAccount details = mapTokenToCxboxDetails(token, accessToken, account);
				token.setDetails(details);
				return details;
			}
		} else {
			return super.getAuthenticationDetails(auth);
		}
	}

	@SuppressWarnings("java:S1874")
	private CxboxKeycloakAccount mapTokenToCxboxDetails(KeycloakAuthenticationToken token,
			KeycloakAuthenticationToken accessToken, SimpleKeycloakAccount account) {
		CxboxKeycloakAccount details = new CxboxKeycloakAccount(
				account.getPrincipal(),
				accessToken.getAccount().getRoles(),
				account.getKeycloakSecurityContext()
		);

		txService.invokeInTx(() -> {
			AppUser user = getUserByLogin(token.getAccount().getKeycloakSecurityContext().getToken().getName().toUpperCase());
			details.setId(user.getId());
			details.setUsername(user.getLogin());
			details.setUserRole(user.getInternalRole());
			details.setLocaleCd(user.getLocale());
			details.setAuthorities(user.getUserRoleList()
					.stream()
					.map(r -> (GrantedAuthority) () -> r.getInternalRoleCd().getKey())
					.collect(Collectors.toSet()));
			details.setTimezone(user.getTimezone());
			return null;
		});
		return details;
	}

	private AppUser getUserByLogin(String login) {
		return jpaDao.getSingleResultOrNull(
				AppUser.class,
				(root, cq, cb) -> cb.equal(cb.upper(root.get(AppUser_.login)), login.toUpperCase())
		);
	}

}

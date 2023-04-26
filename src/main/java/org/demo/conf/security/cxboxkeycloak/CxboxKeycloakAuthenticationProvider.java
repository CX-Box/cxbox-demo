package org.demo.conf.security.cxboxkeycloak;

import org.demo.repository.DepartmentRepository;
import org.demo.repository.UserRepository;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.core.service.impl.UserRoleService;
import org.cxbox.core.util.SQLExceptions;
import org.cxbox.model.core.dao.JpaDao;
import org.cxbox.model.core.entity.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.LockOptions;
import org.keycloak.adapters.springsecurity.account.SimpleKeycloakAccount;
import org.keycloak.adapters.springsecurity.authentication.KeycloakAuthenticationProvider;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Set;

import static org.cxbox.api.service.session.InternalAuthorizationService.VANILLA;

@Component
@Slf4j
public class CxboxKeycloakAuthenticationProvider extends KeycloakAuthenticationProvider {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private DepartmentRepository departmentRepository;

	@Autowired
	private JpaDao jpaDao;

	@Autowired
	private TransactionService txService;

	@Autowired
	private InternalAuthorizationService authzService;

	@Autowired
	private UserRoleService userRoleService;

	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		Authentication auth = super.authenticate(authentication);
		KeycloakAuthenticationToken accessToken = (KeycloakAuthenticationToken) auth;
		SimpleKeycloakAccount account = (SimpleKeycloakAccount) accessToken.getDetails();

		txService.invokeInTx(() -> {
			upsertUserAndRoles(
					account.getKeycloakSecurityContext().getToken(),
					accessToken.getAccount().getRoles()
			);
			return null;
		});

		return authentication;
	}

	//TODO>>taken "as is" from real project - refactor
	private void upsertUserAndRoles(AccessToken accessToken, Set<String> roles) {
		txService.invokeInNewTx(() -> {
			authzService.loginAs(authzService.createAuthentication(VANILLA));
			User user = null;
			try {
				user = getUserByLogin(accessToken.getName().toUpperCase());
				if (user == null) {
					upsert(accessToken, roles.stream().findFirst().orElse(null));
				}
				user = getUserByLogin(accessToken.getName().toUpperCase());
				userRoleService.upsertUserRoles(user.getId(), new ArrayList<>(roles));
			} catch (Exception e) {
				log.error(e.getLocalizedMessage(), e);
			}

			if (user == null) {
				throw new UsernameNotFoundException(null);
			}
			SecurityContextHolder.getContext().setAuthentication(null);
			return null;
		});
	}

	//TODO>>taken "as is" from real project - refactor
	public User upsert(AccessToken accessToken, String role) {
		txService.invokeInNewTx(() -> {
					authzService.loginAs(authzService.createAuthentication(VANILLA));
					for (int i = 1; i <= 10; i++) {
						User existing = getUserByLogin(accessToken.getName().toUpperCase());
						if (existing != null) {
							jpaDao.lockAndRefresh(existing, LockOptions.WAIT_FOREVER);
							updateUser(accessToken, role, existing);
							return existing;
						}
						try {
							User newUser = new User();
							updateUser(accessToken, role, newUser);
							Long id = txService.invokeNoTx(() -> userRepository.save(newUser).getId());
							return userRepository.findById(id);
						} catch (Exception ex) {
							if (SQLExceptions.isUniqueConstraintViolation(ex)) {
								log.error(ex.getLocalizedMessage(), ex);
							} else {
								throw ex;
							}
						}
					}
					SecurityContextHolder.getContext().setAuthentication(null);
					return null;
				}
		);
		return null;
	}

	private User getUserByLogin(String login) {
		return userRepository.findOne(
				(root, cq, cb) -> cb.equal(cb.upper(root.get(User_.login)), login.toUpperCase())
		).orElse(null);
	}

	private void updateUser(AccessToken accessToken, String role, User user) {
		if (user.getLogin() == null) {
			user.setLogin(accessToken.getName().toUpperCase());
		}

		user.setInternalRole(new LOV(role));
		user.setUserPrincipalName(accessToken.getName());
		user.setFirstName(accessToken.getGivenName());
		user.setLastName(accessToken.getFamilyName());
		user.setTitle(accessToken.getName());
		user.setFullUserName(accessToken.getName());
		user.setEmail(accessToken.getEmail());
		user.setPhone(accessToken.getPhoneNumber());
		user.setActive(true);
		user.setDepartment(departmentRepository.findById(0L).orElse(null));
	}

}

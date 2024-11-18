package org.demo.conf.security.oidc;


import static org.cxbox.api.service.session.InternalAuthorizationService.SystemUsers.VANILLA;

import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.core.util.SQLExceptions;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.customization.role.UserRoleService;
import org.demo.conf.cxbox.customization.role.UserService;
import org.demo.entity.core.User;
import org.demo.repository.core.UserRepository;
import org.hibernate.LockOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CxboxAuthUserRepository {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private JpaDao jpaDao;

	@Autowired
	private TransactionService txService;

	@Autowired
	private InternalAuthorizationService authzService;

	@Autowired
	private UserRoleService userRoleService;

	@Autowired
	private UserService userService;

	public User getUserIdOrElseCreate(String login, Set<String> roles) throws AuthenticationException {
		return txService.invokeInTx(() -> upsertUserAndRoles(login, roles));
	}

	//TODO>>taken "as is" from real project - refactor
	private User upsertUserAndRoles(String login, Set<String> roles) {
		return txService.invokeInNewTx(() -> {
			User user = null;
			try {
				user = userService.getUserByLogin(login.toUpperCase());
				if (user == null) {
					upsert(login);
				}
				user = userService.getUserByLogin(login.toUpperCase());
				Set<String> currentRoles = user.getUserRoleList().stream().map(e -> e.getInternalRoleCd())
						.collect(Collectors.toSet());
				if (!(currentRoles.containsAll(roles) && roles.containsAll(currentRoles))) {
					authzService.loginAs(authzService.createAuthentication(VANILLA));
					userRoleService.upsertUserRoles(user.getId(), new ArrayList<>(roles));
				}

			} catch (Exception e) {
				log.error(e.getLocalizedMessage(), e);
			}

			if (user == null) {
				throw new UsernameNotFoundException(null);
			}
			SecurityContextHolder.getContext().setAuthentication(null);
			return user;
		});
	}

	//TODO>>taken "as is" from real project - refactor
	public User upsert(String login) {
		txService.invokeInNewTx(() -> {
					authzService.loginAs(authzService.createAuthentication(VANILLA));
					for (int i = 1; i <= 10; i++) {
						User existing = userService.getUserByLogin(login.toUpperCase());
						if (existing != null) {
							jpaDao.lockAndRefresh(existing, LockOptions.WAIT_FOREVER);
							updateUser(login, existing);
							return existing;
						}
						try {
							User newUser = new User();
							updateUser(login, newUser);
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

	private void updateUser(String login, User user) {
		if (user.getLogin() == null) {
			user.setLogin(login);
		}
		user.setFirstName(login);
		user.setLastName(login);
	}

}

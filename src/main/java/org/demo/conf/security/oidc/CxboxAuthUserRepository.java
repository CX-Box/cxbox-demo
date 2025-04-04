package org.demo.conf.security.oidc;


import static org.cxbox.api.service.session.InternalAuthorizationService.SystemUsers.VANILLA;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.core.util.SQLExceptions;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.customization.role.UserRoleService;
import org.demo.conf.cxbox.customization.role.UserService;
import org.demo.entity.core.User;
import org.demo.entity.core.UserRole;
import org.demo.repository.core.UserRepository;
import org.hibernate.LockOptions;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CxboxAuthUserRepository {

	private final UserRepository userRepository;

	private final JpaDao jpaDao;

	private final TransactionService txService;

	private final InternalAuthorizationService authService;

	private final UserRoleService userRoleService;

	private final UserService userService;

	public User getUserIdOrElseCreate(String login, Set<String> roles) throws AuthenticationException {
		return txService.invokeInNewTx(() -> upsertUserAndRoles(login, roles));
	}

	//TODO>>taken "as is" from real project - refactor
	private User upsertUserAndRoles(String login, Set<String> roles) {
		User user = null;
		try {
			user = userService.getUserByLogin(login.toUpperCase());
			if (user == null) {
				upsert(login);
			}
			user = userService.getUserByLogin(login.toUpperCase());
			List<UserRole> userRoleList = user.getUserRoleList();
			Set<String> currentRoles = userRoleList != null
					? userRoleList.stream().map(UserRole::getInternalRoleCd).collect(Collectors.toSet())
					: new HashSet<>();
			if (!(currentRoles.containsAll(roles) && roles.containsAll(currentRoles))) {
				authService.loginAs(authService.createAuthentication(VANILLA));
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
	}

	//TODO>>taken "as is" from real project - refactor
	public User upsert(String login) {
		authService.loginAs(authService.createAuthentication(VANILLA));
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
				Long id = userRepository.save(newUser).getId();
				return userRepository.findById(id).orElse(null);
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

	private void updateUser(String login, User user) {
		if (user.getLogin() == null) {
			user.setLogin(login);
		}
		user.setFirstName(login);
		user.setLastName(login);
	}

}

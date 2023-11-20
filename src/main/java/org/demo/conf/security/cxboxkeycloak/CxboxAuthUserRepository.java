package org.demo.conf.security.cxboxkeycloak;


import static org.cxbox.api.service.session.InternalAuthorizationService.SystemUsers.VANILLA;

import java.util.ArrayList;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.core.service.impl.UserRoleService;
import org.cxbox.core.util.SQLExceptions;
import org.cxbox.model.core.dao.JpaDao;
import org.cxbox.model.core.entity.User;
import org.cxbox.model.core.entity.User_;
import org.demo.repository.DepartmentRepository;
import org.demo.repository.UserRepository;
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
	private DepartmentRepository departmentRepository;

	@Autowired
	private JpaDao jpaDao;

	@Autowired
	private TransactionService txService;

	@Autowired
	private InternalAuthorizationService authzService;

	@Autowired
	private UserRoleService userRoleService;

	public Long getUserIdOrElseCreate(String login, Set<String> roles) throws AuthenticationException {
		return txService.invokeInTx(() -> upsertUserAndRoles(login, roles));
	}

	//TODO>>taken "as is" from real project - refactor
	private Long upsertUserAndRoles(String login, Set<String> roles) {
		return txService.invokeInNewTx(() -> {
			authzService.loginAs(authzService.createAuthentication(VANILLA));
			User user = null;
			try {
				user = getUserByLogin(login.toUpperCase());
				if (user == null) {
					upsert(login, roles.stream().findFirst().orElse(null));
				}
				user = getUserByLogin(login.toUpperCase());
				userRoleService.upsertUserRoles(user.getId(), new ArrayList<>(roles));
			} catch (Exception e) {
				log.error(e.getLocalizedMessage(), e);
			}

			if (user == null) {
				throw new UsernameNotFoundException(null);
			}
			SecurityContextHolder.getContext().setAuthentication(null);
			return user.getId();
		});
	}

	//TODO>>taken "as is" from real project - refactor
	public User upsert(String login, String role) {
		txService.invokeInNewTx(() -> {
					authzService.loginAs(authzService.createAuthentication(VANILLA));
					for (int i = 1; i <= 10; i++) {
						User existing = getUserByLogin(login.toUpperCase());
						if (existing != null) {
							jpaDao.lockAndRefresh(existing, LockOptions.WAIT_FOREVER);
							updateUser(login, role, existing);
							return existing;
						}
						try {
							User newUser = new User();
							updateUser(login, role, newUser);
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
				(root, cq, cb) -> cb.equal(root.get(User_.login), login)
		).orElse(null);
	}

	private void updateUser(String login, String role, User user) {
		if (user.getLogin() == null) {
			user.setLogin(login);
		}
		user.setInternalRole(new LOV(role));
		user.setUserPrincipalName(login);
		user.setFirstName(login);
		user.setLastName(login);
		user.setTitle(login);
		user.setFullUserName(login);
		user.setEmail(login);
		user.setPhone(login);
		user.setActive(true);
		user.setDepartment(departmentRepository.findById(0L).orElse(null));
	}

}

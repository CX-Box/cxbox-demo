package org.demo.conf.cxbox.extension.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.Optional;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.service.session.IUser;
import org.cxbox.core.crudma.CrudmaActionHolder.CrudmaAction;
import org.cxbox.core.crudma.CrudmaEvent;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.util.session.SessionService;
import org.demo.entity.core.User;
import org.demo.repository.core.UserRepository;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CrudmaEventListener implements ApplicationListener<CrudmaEvent> {

	public static final String UNDEFINED = "undefined";

	private final MeterRegistry registry;

	private final SessionService sessionService;

	private final UserRepository userRepository;

	public CrudmaEventListener(MeterRegistry registry, SessionService sessionService, UserRepository userRepository) {
		this.registry = registry;
		this.sessionService = sessionService;
		this.userRepository = userRepository;
		registry.counter("platform-requests");
	}

	@Override
	public final void onApplicationEvent(final CrudmaEvent event) {
		final CrudmaAction crudmaAction = event.getCrudmaAction();
		final BusinessComponent bc = crudmaAction.getBc();
		Counter counter = registry.counter(
				"platform-requests",
				"screen", Optional.ofNullable(bc.getHierarchy().getScreenName()).orElse(UNDEFINED),
				"bc", Optional.ofNullable(bc.getName()).orElse(UNDEFINED),
				"crudmaAction", Optional.ofNullable(crudmaAction.getName()).orElse(UNDEFINED),
				"user", Optional.ofNullable(getUserLogin()).orElse(UNDEFINED),
				"userFullName", Optional.ofNullable(getUserFullName()).orElse(UNDEFINED),
				"error", event.getException() == null ? "false" : "true"
		);
		counter.increment();
	}

	public static String getUserLogin() {
		return Stream.of(SecurityContextHolder.getContext())
				.map(SecurityContext::getAuthentication)
				.map(Authentication::getName)
				.findFirst()
				.orElse(null);
	}

	/**
	 * Full name is not unique and may change, so it goes to a separate tag and the "user" tag keeps the login
	 */
	private String getUserFullName() {
		try {
			return Optional.ofNullable(sessionService.getSessionUser())
					.map(IUser::getId)
					.flatMap(userRepository::findById)
					.map(User::getFullName)
					.filter(fullName -> !fullName.isEmpty())
					.orElse(null);
		} catch (Exception e) {
			log.debug("Cannot resolve user full name for metrics", e);
			return null;
		}
	}

}

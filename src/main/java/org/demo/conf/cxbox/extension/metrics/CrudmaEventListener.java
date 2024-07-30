package org.demo.conf.cxbox.extension.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.Optional;
import java.util.stream.Stream;
import org.cxbox.core.crudma.CrudmaActionHolder.CrudmaAction;
import org.cxbox.core.crudma.CrudmaEvent;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.springframework.context.ApplicationListener;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CrudmaEventListener implements ApplicationListener<CrudmaEvent> {

	public static final String UNDEFINED = "undefined";

	private final MeterRegistry registry;

	public CrudmaEventListener(MeterRegistry registry) {
		this.registry = registry;
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

}

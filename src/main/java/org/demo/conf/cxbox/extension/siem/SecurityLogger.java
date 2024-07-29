package org.demo.conf.cxbox.extension.siem;

import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SecurityLogger {

	public void logSecurityEvent(SecurityStatus securityStatus, BusinessComponent bc, List<?> objects,
			String userIdentifier, String sessionIdentifier) {
		log.info("SIEM event. " +
				" operation: " + securityStatus.name() +
				" endpoint (resource): " + bc.getName() +
				" user: " + userIdentifier +
				" session: " + sessionIdentifier +
				" objects: " + objects.stream().map(Object::toString).collect(Collectors.joining(", ")));
	}

}

package org.demo.conf.cxbox.extension.siem;

import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SecurityLogger {

	public void logSecurityEvent(String actionType, BusinessComponent bc, String userIdentifier, String userRole, String sessionIdentifier, String ipAddress, String data) {
		log.info(
				"SIEM event. " +
						"operation: " + actionType +
						", endpoint (resource): " + bc.getName() +
						(bc.getId() == null ? "" : " (" + bc.getId() + ")") +
						", user: " + userIdentifier + " (" + userRole + ")" +
						", session: " + sessionIdentifier +
						", ipAddress: " + ipAddress +
						", data: " + data
		);
	}

}

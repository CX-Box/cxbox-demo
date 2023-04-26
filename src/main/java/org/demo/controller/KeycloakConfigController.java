package org.demo.controller;

import org.demo.conf.security.cxboxkeycloak.KeycloakConfigProperties;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/")
@RequiredArgsConstructor
public class KeycloakConfigController {

	private final KeycloakConfigProperties keycloakConfigProperties;

	@GetMapping("/auth/keycloak.json")
	public ResponseEntity<Map<String, Object>> get() {
		return ResponseEntity.ok(keycloakConfigProperties.getKeycloak());
	}

}

package org.demo.service.cxbox.external.lov;

import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import static org.springframework.web.util.UriComponentsBuilder.fromUriString;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.demo.microservice.dto.DictDTO;
import org.demo.util.IntegrationConfiguration;
import org.demo.util.IntegrationURLBuilder;
import org.demo.util.RequestHelper;
import org.demo.util.RestResponsePage;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class LovClient implements RequestHelper {

	public static final String API_V_1_LOV = "";

	private final IntegrationConfiguration integrationConfig;

	private final RestTemplate restTemplate;

	private final IntegrationURLBuilder integrationURLBuilder;

	public ResponseEntity<RestResponsePage<DictDTO>> getAll(final BusinessComponent bc) {
		return restTemplate.exchange(
				integrationURLBuilder.getURLWithQueryParams(bc, integrationConfig.getLovServerUrl() + API_V_1_LOV).build()
						.normalize().encode().toUriString(),
				GET, null, new ParameterizedTypeReference<>() {
				}
		);
	}

	public ResponseEntity<DictDTO> getOne(final Long id) {
		return restTemplate.exchange(
				fromUriString(integrationConfig.getLovServerUrl() + API_V_1_LOV + "/{id}").build().expand(id).normalize().encode()
						.toUriString(),
				GET, null, DictDTO.class
		);
	}

	public ResponseEntity<Void> delete(final Long id) {
		return restTemplate.exchange(
				fromUriString(integrationConfig.getLovServerUrl() + API_V_1_LOV + "/{id}").build().expand(id).normalize().encode()
						.toUriString(),
				DELETE, null, Void.class
		);
	}

	public ResponseEntity<DictDTO> create(final DictDTO dto) {
		return restTemplate.exchange(
				fromUriString(integrationConfig.getLovServerUrl() + API_V_1_LOV).build().normalize().encode().toUriString(),
				POST, new HttpEntity<>(dto), DictDTO.class
		);
	}

	public ResponseEntity<DictDTO> update(final DictDTO dto) {
		return restTemplate.exchange(
				fromUriString(integrationConfig.getLovServerUrl() + API_V_1_LOV).build().normalize().encode().toUriString(),
				PUT, new HttpEntity<>(dto), DictDTO.class
		);
	}

}

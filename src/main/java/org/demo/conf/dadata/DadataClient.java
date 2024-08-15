package org.demo.conf.dadata;

import lombok.RequiredArgsConstructor;
import org.demo.conf.dadata.dto.request.PartySuggestionRq;
import org.demo.conf.dadata.dto.response.PartySuggestionRs;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class DadataClient {

	private final RestTemplate restTemplate;

	public PartySuggestionRs getPartySuggestion(PartySuggestionRq rqDto) {
		var responseEntity = restTemplate.postForEntity("/suggest/party", rqDto, PartySuggestionRs.class);
		return responseEntity.getBody();
	}

}

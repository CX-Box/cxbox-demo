package org.demo.client;

import feign.Headers;
import org.demo.client.request.PartySuggestionRequestDto;
import org.demo.client.response.PartySuggestionResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient(value = "dadata", url = "${integration.dadata.base-url}", configuration = DadataClientConfiguration.class)
public interface DadataClient {

	@RequestMapping(method = RequestMethod.POST, value = "/party")
	@Headers("Content-Type: application/json")
	PartySuggestionResponseDto getPartySuggestion(PartySuggestionRequestDto rqDto);

}

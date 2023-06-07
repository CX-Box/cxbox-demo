package org.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.api.data.ResultPage;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AbstractCrudmaService;
import org.cxbox.core.exception.ClientException;
import org.demo.client.DadataClient;
import org.demo.client.request.PartySuggestionRequestDto;
import org.demo.client.response.PartySuggestionResponseDto;
import org.demo.client.response.PartySuggestionResponseDto.Suggestion;
import org.demo.dto.CompanySuggestionDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DadataCompanySuggestionPickListService extends AbstractCrudmaService {

	private static final String SEARCH_QUERY_PARAMETER = "query";

	private static final String SEARCH_COUNT_PARAMETER = "_limit";

	private static final String MISSING_QUERY_PARAMETER_EXCEPTION_MESSAGE = "No query parameter provided";

	private final DadataClient dadataClient;

	@Override
	public ResultPage<CompanySuggestionDTO> getAll(BusinessComponent bc) {
		return ResultPage.of(getSuggestions(bc), false);
	}

	private List<CompanySuggestionDTO> getSuggestions(BusinessComponent bc) {
		String query = getBcParameter(bc, SEARCH_QUERY_PARAMETER)
				.orElseThrow(
						() -> new ClientException(MISSING_QUERY_PARAMETER_EXCEPTION_MESSAGE)
				);
		Integer countParameter = getBcParameter(bc, SEARCH_COUNT_PARAMETER)
				.filter(StringUtils::isNumeric)
				.map(Integer::parseInt)
				.orElse(null);
		PartySuggestionRequestDto suggestionRq = PartySuggestionRequestDto.builder()
				.query(query)
				.count(countParameter)
				.build();
		PartySuggestionResponseDto partySuggestionResponse = dadataClient.getPartySuggestion(suggestionRq);
		return partySuggestionResponse.getSuggestions()
				.stream()
				.map(this::mapToSuggestionDataResponseDTO)
				.collect(Collectors.toList());
	}


	private Optional<String> getBcParameter(BusinessComponent bc, String parameterName) {
		return Optional.ofNullable(bc.getParameters())
				.map(busComp -> busComp.getParameter(parameterName));
	}


	private CompanySuggestionDTO mapToSuggestionDataResponseDTO(Suggestion suggestion) {
		return CompanySuggestionDTO.builder()
				.id(UUID.randomUUID().toString())
				.value(suggestion.getValue())
				.address(suggestion.getData().getAddress().getValue())
				.build();
	}

}

package org.demo.service.cxbox.external.dadatacompany;

import com.kuliginstepan.dadata.client.DadataClient;
import com.kuliginstepan.dadata.client.domain.Suggestion;
import com.kuliginstepan.dadata.client.domain.organization.Organization;
import com.kuliginstepan.dadata.client.domain.organization.OrganizationRequestBuilder;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.ExternalBaseDAO;
import org.cxbox.core.dao.impl.AbstractExternalBaseDAO;
import org.cxbox.core.exception.ClientException;
import org.demo.dto.CompanySuggestionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyDAO extends AbstractExternalBaseDAO<CompanySuggestionDTO> implements
		ExternalBaseDAO<CompanySuggestionDTO> {

	private static final String SEARCH_QUERY_PARAMETER = "query";

	private static final String SEARCH_COUNT_PARAMETER = "_limit";

	private static final String MISSING_QUERY_PARAMETER_EXCEPTION_MESSAGE = "No query parameter provided";

	private final DadataClient dadataClient;

	@Override
	public String getId(final CompanySuggestionDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final CompanySuggestionDTO entity) {
		entity.setId(id);
	}

	@Override
	public CompanySuggestionDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getSuggestions(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<CompanySuggestionDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getSuggestions(bc));
	}

	@Override
	public CompanySuggestionDTO update(BusinessComponent bc, CompanySuggestionDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public CompanySuggestionDTO create(final BusinessComponent bc, final CompanySuggestionDTO entity) {
		throw new IllegalStateException();
	}

	private List<CompanySuggestionDTO> getSuggestions(BusinessComponent bc) {
		String query = Optional.ofNullable(bc.getParameters())
				.map(e -> e.getParameter(SEARCH_QUERY_PARAMETER))
				.orElseThrow(() -> new ClientException(MISSING_QUERY_PARAMETER_EXCEPTION_MESSAGE));
		Integer countParameter = Optional.ofNullable(bc.getParameters())
				.map(busComp -> busComp.getParameter(SEARCH_COUNT_PARAMETER))
				.filter(StringUtils::isNumeric)
				.map(Integer::parseInt)
				.orElse(10);
		List<Suggestion<Organization>> list = dadataClient.suggestOrganization(
				OrganizationRequestBuilder.create(query).count(countParameter).build()).collectList().block();
		return Optional.ofNullable(list).orElseGet(ArrayList::new)
				.stream()
				.map(suggestion -> CompanySuggestionDTO.builder()
						.id(UUID.randomUUID().toString())
						.value(suggestion.getValue())
						.address(suggestion.getData().getAddress().getValue())
						.build())
				.collect(Collectors.toList());
	}


}

package org.demo.service.cxbox.anysource.dadatacompany;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.conf.dadata.DadataClient;
import org.demo.conf.dadata.dto.request.PartySuggestionRq;
import org.demo.conf.dadata.dto.response.PartySuggestionRs;
import org.demo.dto.cxbox.anysource.CompanySuggestionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyDao extends AbstractAnySourceBaseDAO<CompanySuggestionDTO> implements
		AnySourceBaseDAO<CompanySuggestionDTO> {

	private static final String SEARCH_QUERY_PARAMETER = "query";

	private static final String SEARCH_COUNT_PARAMETER = "_limit";

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
				.orElse(null);

		if (StringUtils.isEmpty(query)) {
			return Collections.emptyList();
		}

		Integer countParameter = Optional.ofNullable(bc.getParameters())
				.map(busComp -> busComp.getParameter(SEARCH_COUNT_PARAMETER))
				.filter(StringUtils::isNumeric)
				.map(Integer::parseInt)
				.orElse(10);
		PartySuggestionRs list = dadataClient.getPartySuggestion(
				PartySuggestionRq.builder().build().setQuery(query).setCount(countParameter));
		return Optional.ofNullable(list.getSuggestions()).orElseGet(ArrayList::new)
				.stream()
				.map(suggestion -> CompanySuggestionDTO.builder()
						.id(UUID.randomUUID().toString())
						.value(suggestion.getValue())
						.address(suggestion.getData().getAddress().getValue())
						.build())
				.collect(Collectors.toList());
	}


}

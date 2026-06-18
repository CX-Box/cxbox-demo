package org.demo.service.cxbox.anysource.clientstatsline;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.ClientSaleLineDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSaleLineStatsDao extends AbstractAnySourceBaseDAO<ClientSaleLineDTO> implements
		AnySourceBaseDAO<ClientSaleLineDTO> {

	private final SaleRepository saleRepository;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public String getId(final ClientSaleLineDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final ClientSaleLineDTO entity) {
		entity.setId(id);
	}

	@Override
	public ClientSaleLineDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<ClientSaleLineDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public ClientSaleLineDTO update(BusinessComponent bc, ClientSaleLineDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public ClientSaleLineDTO create(final BusinessComponent bbc, final ClientSaleLineDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<ClientSaleLineDTO> getStats(BusinessComponent bc) {
		var parentField = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc);
		var filter = Optional.ofNullable(parentField)
				.map(e -> e.getValues().stream()
						.map(value -> FieldOfActivity.getByValue(value.getValue()))
						.collect(Collectors.toSet()))
				.orElse(new HashSet<>());
		filter = filter.isEmpty() ? null : filter;
		return saleRepository.getSalesStatsByMonthAndClient(filter).stream()
				.<ClientSaleLineDTO>map(stat -> ClientSaleLineDTO.builder()
						.id(stat.id())
						.month(stat.month())
						.year(stat.year())
						.sum(stat.sum())
						.fullName(stat.fullName())
						.vstamp(0L)
						.build())
				.toList();
	}

}

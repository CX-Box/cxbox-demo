package org.demo.service.cxbox.anysource.clientstatsline;

import static org.demo.dto.cxbox.anysource.ClientSaleLineDTO.monthYearString;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
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

	public static final Map<Number, String> COLOR_LIST = Map.ofEntries(
			Map.entry(1, "#56dee8"),
			Map.entry(2, "#56d2e8"),
			Map.entry(3, "#56c6e8"),
			Map.entry(4, "#56bae8"),
			Map.entry(5, "#56aee8"),
			Map.entry(6, "#56a1e8"),
			Map.entry(7, "#5695e8"),
			Map.entry(8, "#5689e8"),
			Map.entry(9, "#567de8"),
			Map.entry(10, "#5671e8"),
			Map.entry(11, "#5665e8"),
			Map.entry(12, "#5658e8"),
			Map.entry(13, "#6056e8"),
			Map.entry(14, "#6c56e8"),
			Map.entry(15, "#7856e8")
	);

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
		AtomicInteger num = new AtomicInteger(1);

		return saleRepository.getSalesStatsByMonthAndClient(filter).stream()
				.<ClientSaleLineDTO>map(stat -> {
					int index = num.getAndIncrement() % COLOR_LIST.size();
					if (index > 15) {
						index = 1;
					}
					return ClientSaleLineDTO.builder()
							.id(stat.id())
							.month(stat.month())
							.year(stat.year())
							.sum(stat.sum())
							.dateSales(monthYearString(stat.month(), stat.year()))
							.fullName(stat.fullName())
							.color(COLOR_LIST.get(index))
							.vstamp(0L)
							.build();
				})
				.toList();
	}

}

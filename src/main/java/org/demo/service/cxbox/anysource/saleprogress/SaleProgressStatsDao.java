package org.demo.service.cxbox.anysource.saleprogress;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.SalesProgressStatsDTO;
import org.demo.entity.Sale;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import lombok.NonNull;

@Service
@RequiredArgsConstructor
public class SaleProgressStatsDao extends AbstractAnySourceBaseDAO<SalesProgressStatsDTO> implements
		AnySourceBaseDAO<SalesProgressStatsDTO> {

	private final SaleRepository saleRepository;

	@Override
	public String getId(final SalesProgressStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final SalesProgressStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public SalesProgressStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats().stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<SalesProgressStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats());
	}

	@Override
	public SalesProgressStatsDTO update(BusinessComponent bc, SalesProgressStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public SalesProgressStatsDTO create(final BusinessComponent bc, final SalesProgressStatsDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<SalesProgressStatsDTO> getStats() {
		SalesProgressStatsDTO dto = new SalesProgressStatsDTO();
		List<Sale> sales = saleRepository.findAll();
		long allSalesSum = sales.stream().map(Sale::getSum).filter(Objects::nonNull).mapToLong(Long::longValue)
				.sum();
		long closedSalesSum = sales.stream()
				.filter(sale -> sale.getStatus() != null && sale.getStatus().equals(SaleStatus.CLOSED)).map(Sale::getSum)
				.filter(Objects::nonNull)
				.mapToLong(Long::longValue).sum();
		double percent;
		if (allSalesSum == 0) {
			percent = 0;
		} else {
			percent = (double) closedSalesSum / (double) allSalesSum;
		}
		dto.setPercent(String.valueOf(percent));
		dto.setSum("$" + closedSalesSum);
		dto.setDescription("From $" + allSalesSum + " KPI sales");
		return List.of(dto);
	}

}

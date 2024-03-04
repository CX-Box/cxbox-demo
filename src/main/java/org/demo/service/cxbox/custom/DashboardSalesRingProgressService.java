package org.demo.service.cxbox.custom;

import com.google.common.collect.ImmutableList;
import java.util.List;
import java.util.Objects;
import org.cxbox.api.data.ResultPage;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AbstractCrudmaService;
import org.cxbox.core.dto.rowmeta.MetaDTO;
import org.demo.dto.cxbox.anysource.SalesProgressStatsDTO;
import org.demo.entity.Sale;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class DashboardSalesRingProgressService extends AbstractCrudmaService {

	@Autowired
	private SaleRepository saleRepository;

	@Override
	public ResultPage<SalesProgressStatsDTO> getAll(BusinessComponent bc) {
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
		dto.setSalesPercent(String.valueOf(percent));
		dto.setSalesSum("$" + closedSalesSum);
		dto.setSalesDescription("From $" + allSalesSum + " KPI sales");
		return ResultPage.of(ImmutableList.of(dto), 1);
	}

	@Override
	public MetaDTO getMeta(BusinessComponent bc) {
		return null;
	}

	@Override
	public long count(BusinessComponent bc) {
		return 1L;
	}

}

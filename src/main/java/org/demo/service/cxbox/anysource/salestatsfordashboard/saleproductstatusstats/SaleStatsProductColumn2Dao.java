package org.demo.service.cxbox.anysource.salestatsfordashboard.saleproductstatusstats;

import java.util.List;
import java.util.Objects;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.entity.Sale;
import org.demo.service.cxbox.anysource.salestatsfordashboard.SaleStatsFilterAndFindService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductColumn2Dao extends AbstractAnySourceBaseDAO<DashboardSalesProductDualDTO> implements
		AnySourceBaseDAO<DashboardSalesProductDualDTO> {

	private final SaleStatsFilterAndFindService saleStatsProductFilterService;

	@Override
	public String getId(final DashboardSalesProductDualDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DashboardSalesProductDualDTO entity) {
		entity.setId(id);
	}

	@Override
	public DashboardSalesProductDualDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<DashboardSalesProductDualDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public DashboardSalesProductDualDTO update(BusinessComponent bc, DashboardSalesProductDualDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public DashboardSalesProductDualDTO create(final BusinessComponent bbc, final DashboardSalesProductDualDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<DashboardSalesProductDualDTO> getStats(BusinessComponent bc) {
		List<Sale> sales = saleStatsProductFilterService.getFilteredSalesByStatusAndFieldOfActivity(bc);
		// Data for dashboardSalesColumn2D
		return saleStatsProductFilterService.processSalesByStatusGroupByDateColumnData(sales);
	}

}

package org.demo.service.cxbox.anysource.saleseller;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.SaleSellerStatsDTO;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import org.demo.service.cxbox.anysource.StatisticUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleClientSellerStatsDao extends AbstractAnySourceBaseDAO<SaleSellerStatsDTO> implements
		AnySourceBaseDAO<SaleSellerStatsDTO> {

	private final ClientRepository clientRepository;

	private final StatisticUtils statisticUtils;

	@Override
	public String getId(final SaleSellerStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final SaleSellerStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public SaleSellerStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getClientStats(bc).stream()
				.filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<SaleSellerStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getClientStats(bc));
	}

	@Override
	public SaleSellerStatsDTO update(BusinessComponent bc, SaleSellerStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public SaleSellerStatsDTO create(final BusinessComponent bc, final SaleSellerStatsDTO entity) {
		throw new IllegalStateException();
	}

	public List<SaleSellerStatsDTO> getClientStats(BusinessComponent bc) {

		Set<FieldOfActivity> filter = null;
		if (bc.getName().equals(CxboxRestController.dashboardClientStats.getName())) {
			filter = statisticUtils.getFilteredActivities(bc);
		}

		return
				clientRepository.getSalesClientByFieldOfActivity(filter).stream()
						.map(entity -> {
									SaleSellerStatsDTO saleSeller = new SaleSellerStatsDTO()
											.setSellerName(entity.sellerName())
											.setClientName(entity.clientName())
											.setSum(entity.sum());
									saleSeller.setId(entity.id());
									return saleSeller;
								}
						)
						.toList();
	}

}
package org.demo.service.cxbox.anysource.salestats;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.DashboardSalesFunnelDTO;
import org.demo.repository.ClientRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.SaleRepository;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsDAO extends AbstractAnySourceBaseDAO<DashboardSalesFunnelDTO> implements
		AnySourceBaseDAO<DashboardSalesFunnelDTO> {

	private final MeetingRepository meetingRepository;

	private final ClientRepository clientRepository;

	private final SaleRepository saleRepository;

	@Override
	public String getId(final DashboardSalesFunnelDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DashboardSalesFunnelDTO entity) {
		entity.setId(id);
	}

	@Override
	public DashboardSalesFunnelDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats().stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<DashboardSalesFunnelDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats());
	}

	@Override
	public DashboardSalesFunnelDTO update(BusinessComponent bc, DashboardSalesFunnelDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public DashboardSalesFunnelDTO create(final BusinessComponent bc, final DashboardSalesFunnelDTO entity) {
		throw new IllegalStateException();
	}

	@NotNull
	private List<DashboardSalesFunnelDTO> getStats() {
		List<DashboardSalesFunnelDTO> result = new ArrayList<>();
		long activitiesAmount = clientRepository.count() + meetingRepository.count();
		result.add(DashboardSalesFunnelDTO.builder().funnelKey("All active Clients").amount(clientRepository.count())
				.color("#779FE9").build());
		result.add(DashboardSalesFunnelDTO.builder().funnelKey("Preparatory Activities").amount(activitiesAmount)
				.color("#8FAFE9").build());
		result.add(DashboardSalesFunnelDTO.builder().funnelKey("Number of Meetings").amount(meetingRepository.count())
				.color("#5F90EA").build());
		result.add(DashboardSalesFunnelDTO.builder().funnelKey("Number of Sales").amount(saleRepository.count())
				.color("#4D83E7").build());
		return result;
	}

}

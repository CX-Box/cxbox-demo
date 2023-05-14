package org.demo.service;

import java.util.ArrayList;
import java.util.List;
import org.cxbox.api.data.ResultPage;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AbstractCrudmaService;
import org.cxbox.core.dto.rowmeta.MetaDTO;
import org.demo.dto.DashboardSalesFunnelDTO;
import org.demo.repository.ClientRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class DashboardSalesFunnelService extends AbstractCrudmaService {

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private SaleRepository saleRepository;
	@Override
	public ResultPage<DashboardSalesFunnelDTO> getAll(BusinessComponent bc) {
		List<DashboardSalesFunnelDTO> salesFunnelDTOS = createSalesFunnelDTOS();
		return ResultPage.of(salesFunnelDTOS, salesFunnelDTOS.size());
	}

	private List<DashboardSalesFunnelDTO> createSalesFunnelDTOS() {
		List<DashboardSalesFunnelDTO> salesFunnelDTOS = new ArrayList<>();
		long activitiesAmount = clientRepository.count() + meetingRepository.count();
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO("All active Clients", clientRepository.count(), "#779FE9"));
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO("Preparatory Activities", activitiesAmount, "#8FAFE9"));
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO("Number of Meetings", meetingRepository.count(), "#5F90EA"));
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO("Number of Sales", saleRepository.count(), "#4D83E7"));
		return salesFunnelDTOS;
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

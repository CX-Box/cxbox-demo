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
		List<DashboardSalesFunnelDTO> result = new ArrayList<>();
		long activitiesAmount = clientRepository.count() + meetingRepository.count();
		result.add(new DashboardSalesFunnelDTO("All active Clients", clientRepository.count(), "#779FE9"));
		result.add(new DashboardSalesFunnelDTO("Preparatory Activities", activitiesAmount, "#8FAFE9"));
		result.add(new DashboardSalesFunnelDTO("Number of Meetings", meetingRepository.count(), "#5F90EA"));
		result.add(new DashboardSalesFunnelDTO("Number of Sales", saleRepository.count(), "#4D83E7"));
		return ResultPage.of(result, result.size());
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

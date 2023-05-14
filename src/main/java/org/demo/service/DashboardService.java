package org.demo.service;

import static org.demo.controller.CxboxRestController.dashboardSalesFunnel;
import static org.demo.controller.CxboxRestController.dashboardSalesRingProgress;

import com.google.common.collect.ImmutableList;
import org.demo.dto.DashboardSalesFunnelDTO;
import org.demo.dto.DashboardSalesRingProgressDTO;
import org.demo.entity.Sale;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.ClientRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.SaleRepository;
import org.cxbox.api.data.ResultPage;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AbstractCrudmaService;
import org.cxbox.core.dto.rowmeta.MetaDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class DashboardService extends AbstractCrudmaService {

	private final ClientRepository clientRepository;

	private final MeetingRepository meetingRepository;

	private final SaleRepository saleRepository;

	final String clients_key = "All active Clients";

	final String activities_key = "Preparatory Activities";

	final String meetings_key = "Number of Meetings";

	final String sales_key = "Number of Sales";

	final String clients_color = "#779FE9";

	final String activities_color = "#8FAFE9";

	final String meetings_color = "#5F90EA";

	final String sales_color = "#4D83E7";

	public DashboardService(ClientRepository clientRepository, MeetingRepository meetingRepository,
			SaleRepository saleRepository) {
		this.clientRepository = clientRepository;
		this.meetingRepository = meetingRepository;
		this.saleRepository = saleRepository;
	}

	@Override
	public ResultPage<DataResponseDTO> getAll(BusinessComponent bc) {
		if (dashboardSalesFunnel.isBc(bc)) {
			List<DataResponseDTO> salesFunnelDTOS = createSalesFunnelDTOS();
			return ResultPage.of(salesFunnelDTOS, salesFunnelDTOS.size());
		} else if (dashboardSalesRingProgress.isBc(bc)) {
			return ResultPage.of(ImmutableList.of(createSalesRingProgressDTO()), 1);
		} else {
			return new ResultPage<>();
		}
	}

	private List<DataResponseDTO> createSalesFunnelDTOS() {
		List<DataResponseDTO> salesFunnelDTOS = new ArrayList<>();
		long activitiesAmount = clientRepository.count() + meetingRepository.count();
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO(clients_key, clientRepository.count(), clients_color));
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO(activities_key, activitiesAmount, activities_color));
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO(meetings_key, meetingRepository.count(), meetings_color));
		salesFunnelDTOS.add(new DashboardSalesFunnelDTO(sales_key, saleRepository.count(), sales_color));
		return salesFunnelDTOS;
	}


	private DashboardSalesRingProgressDTO createSalesRingProgressDTO() {
		DashboardSalesRingProgressDTO dto = new DashboardSalesRingProgressDTO();
		List<Sale> sales = saleRepository.findAll();
		long allSalesSum = sales.stream().map(Sale::getSum).filter(Objects::nonNull).mapToLong(Long::longValue)
				.sum();
		long closedSalesSum = sales.stream()
				.filter(sale -> sale.getStatus() != null && sale.getStatus().equals(SaleStatus.Closed)).map(Sale::getSum)
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
		return dto;
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

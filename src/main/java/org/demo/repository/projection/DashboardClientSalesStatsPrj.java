package org.demo.repository.projection;

public record DashboardClientSalesStatsPrj(
		String clientName,
		Long countSale,
		Long clientId
) {

}

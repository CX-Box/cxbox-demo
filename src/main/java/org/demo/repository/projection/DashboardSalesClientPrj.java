package org.demo.repository.projection;

import java.time.LocalDateTime;
import org.demo.entity.enums.SaleStatus;

public record DashboardSalesClientPrj(
		String id,
		String clientName,
		String sellerName,
		Long sum,
		Long saleCount,
		SaleStatus status,
		LocalDateTime firstSaleDate,
		LocalDateTime lastActivityDate,
		Double avgB2bDeal,
		Long maxContract,
		Long confirmedRevenue,
		Long openPipeline
) {}
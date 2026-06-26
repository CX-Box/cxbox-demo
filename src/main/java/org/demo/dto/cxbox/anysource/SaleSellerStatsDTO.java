package org.demo.dto.cxbox.anysource;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.enums.SaleStatus;

@Getter
@Setter
@Accessors(chain = true)
public class SaleSellerStatsDTO extends DataResponseDTO {

	private	String clientName;
	private String sellerName;
	private Long sum;
	private	Long saleCount;
	private	SaleStatus status;
	private	LocalDateTime firstSaleDate;
	private LocalDateTime lastActivityDate;
	private Double avgB2bDeal;
	private Long maxContract;
	private Long confirmedRevenue;
	private Long openPipeline;
	private Long sellerCount;
	private String customFieldColor = "#edaa";
}
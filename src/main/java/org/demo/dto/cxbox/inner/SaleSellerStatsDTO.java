package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@Accessors(chain = true)
public class SaleSellerStatsDTO extends DataResponseDTO {

	private String sellerName;

	private Long sum;

	private String clientName;


}
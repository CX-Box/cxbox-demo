package org.demo.dto.cxbox.anysource;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.enums.SaleStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder(toBuilder = true)
public class DashboardSalesProductTypeDateDTO extends DataResponseDTO {

	private String dateCreatedSales;

	private String productType;

	private Long sum;

}

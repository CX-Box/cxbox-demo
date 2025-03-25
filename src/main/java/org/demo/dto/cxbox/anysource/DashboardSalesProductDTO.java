package org.demo.dto.cxbox.anysource;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.dictionary.Product;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder(toBuilder = true)
public class DashboardSalesProductDTO extends DataResponseDTO {

	private Product productName;

	private String clientName;

	private Long sum;

	private String color;

}

package org.demo.dto;

import org.cxbox.api.data.dto.DataResponseDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.Product;

@Getter
@Setter
@NoArgsConstructor
public class ProductPickDTO extends DataResponseDTO {

	private String shortName;

	@SearchParameter(name = "productCode", provider = StringValueProvider.class)
	private String productCode;

	public ProductPickDTO(Product entity) {
		this.id = entity.getId().toString();
		this.shortName = entity.getShortName();
		this.productCode = entity.getProductCode();
	}

}

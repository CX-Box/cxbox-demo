package org.demo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.ProductSync;

@Getter
@Setter
@NoArgsConstructor
public class ProductSyncDTO extends DataResponseDTO {

	@SearchParameter(name = "productCode", provider = StringValueProvider.class)
	private Long pageSize;

	public ProductSyncDTO(ProductSync entity) {
		this.id = entity.getId().toString();
		this.pageSize = entity.getPageSize();
	}

}

package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DictionaryValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.demo.entity.Sale;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.SaleStatus;

@Getter
@Setter
@NoArgsConstructor
public class SaleDTO extends DataResponseDTO {

	@SearchParameter(name = "client.fullName")
	private String clientName;

	private Long clientId;

	@SearchParameter(name = "product", provider = DictionaryValueProvider.class)
	private Product product;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private SaleStatus status;

	private Long sum;

	private String color;

	public SaleDTO(Sale sale) {
		this.id = sale.getId().toString();
		this.clientName = sale.getClient() == null ? null : sale.getClient().getFullName();
		this.product = sale.getProduct();
		this.status = sale.getStatus();
		this.sum = sale.getSum();
		this.color = "#edaa";
	}

}

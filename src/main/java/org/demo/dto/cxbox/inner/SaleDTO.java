package org.demo.dto.cxbox.inner;

import java.time.LocalDateTime;
import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateTimeValueProvider;
import org.cxbox.core.util.filter.provider.impl.DictionaryValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider.BaseEnum;
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.cxbox.core.util.filter.provider.impl.MultiFieldValueProvider;
import org.demo.entity.Client;
import org.demo.entity.Sale;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;

@Getter
@Setter
@NoArgsConstructor
public class SaleDTO extends DataResponseDTO {

	@SearchParameter(name = "client.fullName")
	private String clientName;

	private Long clientId;

	@SearchParameter(name="clientSeller.fullName")
	private String clientSellerName;

	private Long clientSellerId;

	@SearchParameter(name = "product", provider = DictionaryValueProvider.class)
	private Product product;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private SaleStatus status;

	@BaseEnum(FieldOfActivity.class)
	@SearchParameter(name = "client.fieldOfActivities", provider = MultiFieldValueProvider.class, multiFieldKey = EnumValueProvider.class)
	private MultivalueField fieldOfActivity;

	@SearchParameter(name = "sum", provider = LongValueProvider.class)
	private Long sum;

	private String color;

	@SearchParameter(name = "createdDate", provider = DateTimeValueProvider.class)
	private LocalDateTime createdDate;

	public SaleDTO(Sale sale) {
		this.id = sale.getId().toString();
		this.clientName = sale.getClient() == null ? null : sale.getClient().getFullName();
		this.product = sale.getProduct();
		this.status = sale.getStatus();
		this.sum = sale.getSum();
		this.color = "#edaa";
		this.fieldOfActivity = sale.getClient() == null ? null : sale.getClient().getFieldOfActivities()
				.stream()
				.collect(MultivalueField.toMultivalueField(
						Enum::name,
						FieldOfActivity::getValue
				));
		this.clientSellerName = Optional.of(sale).map(Sale::getClientSeller).map(Client::getFullName).orElse(null);
		this.createdDate = sale.getCreatedDate();
	}

}

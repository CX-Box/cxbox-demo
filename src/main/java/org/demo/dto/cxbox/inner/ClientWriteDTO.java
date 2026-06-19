package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider.BaseEnum;
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.cxbox.core.util.filter.provider.impl.MultiFieldValueProvider;
import org.demo.entity.Client;
import org.demo.entity.Sale;
import org.demo.entity.enums.FieldOfActivity;

@Getter
@Setter
@NoArgsConstructor
public class ClientWriteDTO extends ClientAbstractDTO {

	@BaseEnum(FieldOfActivity.class)
	@SearchParameter(name = "fieldOfActivities", provider = MultiFieldValueProvider.class, multiFieldKey = EnumValueProvider.class)
	private MultivalueField fieldOfActivity;

	@SearchParameter(name = "salesClientList.id", provider = LongValueProvider.class)
	private MultivalueField salesClient;

	private Long salesSumClient;

	public ClientWriteDTO(Client client) {
		super(client);
		this.fieldOfActivity = client.getFieldOfActivities()
				.stream()
				.collect(MultivalueField.toMultivalueField(
						Enum::name,
						FieldOfActivity::getValue
				));
		this.salesClient = client.getSalesClientList().stream().collect(MultivalueField.toMultivalueField(
				e -> String.valueOf(e.getId()),
				e -> String.valueOf(e.getSum())
		));
		this.salesSumClient = client.getSalesClientList().stream()
				.mapToLong(Sale::getSum).sum();

	}

}

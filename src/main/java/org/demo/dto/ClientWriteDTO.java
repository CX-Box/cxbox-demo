package org.demo.dto;

import org.demo.entity.Client;
import org.demo.entity.enums.FieldOfActivity;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientWriteDTO extends ClientAbstractDTO {

	@SearchParameter(name = "fieldOfActivities.value", multiFieldKey = StringValueProvider.class)
	private MultivalueField fieldOfActivity;

	public ClientWriteDTO(Client client) {
		super(client);
		this.fieldOfActivity = client.getFieldOfActivities()
				.stream()
				.collect(MultivalueField.toMultivalueField(
						Enum::name,
						FieldOfActivity::getValue
				));
	}

}

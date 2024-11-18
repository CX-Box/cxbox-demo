package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.demo.entity.Client;
import org.demo.entity.enums.FieldOfActivity;

@Getter
@Setter
@NoArgsConstructor
public class ClientWriteDTO extends ClientAbstractDTO {

	/*	@BaseEnum(FieldOfActivity.class)
		@SearchParameter(name = "fieldOfActivities", provider = MultiFieldValueProvider.class, multiFieldKey = EnumValueProvider.class)*/
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

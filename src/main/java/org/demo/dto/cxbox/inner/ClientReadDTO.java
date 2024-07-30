package org.demo.dto.cxbox.inner;

import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.demo.entity.Client;
import org.demo.entity.enums.FieldOfActivity;

@Getter
@Setter
@NoArgsConstructor
public class ClientReadDTO extends ClientAbstractDTO {

	private String fieldOfActivity;

	public ClientReadDTO(Client client) {
		super(client);
		this.fieldOfActivity = client.getFieldOfActivities()
				.stream()
				.map(FieldOfActivity::getValue)
				.collect(Collectors.joining(", "));

	}

}

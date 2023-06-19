package org.demo.dto;

import com.google.common.base.Splitter;
import org.demo.entity.Client;
import org.demo.entity.enums.FieldOfActivity;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
				.collect(Collectors.joining(",",",",","));

	}

}

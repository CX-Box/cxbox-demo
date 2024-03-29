package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.core.User;

@Getter
@Setter
@NoArgsConstructor
public class ResponsibleDTO extends DataResponseDTO {

	private String name;

	public ResponsibleDTO(User user) {
		this.id = user.getId().toString();
		this.name = user.getFullName();
	}

}

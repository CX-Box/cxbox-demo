package org.demo.dto;

import org.cxbox.api.data.dto.DataResponseDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.User;

@Getter
@Setter
@NoArgsConstructor
public class UserPickDTO extends DataResponseDTO {

	private String fullUserName;

	public UserPickDTO(User entity) {
		this.id = entity.getId().toString();
		this.fullUserName = entity.getFullUserName();
	}

}

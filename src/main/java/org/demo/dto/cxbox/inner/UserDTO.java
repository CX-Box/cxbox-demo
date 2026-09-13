package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.demo.entity.core.User;

@Getter
@Setter
@NoArgsConstructor
public class UserDTO extends DataResponseDTO {

	@SearchParameter(name = "fullName")
	private String fullName;

	public UserDTO(User entity) {
		this.id = entity.getId().toString();
		this.fullName = entity.getFullName();
	}

}

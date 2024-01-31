package org.demo.dto;

import org.cxbox.api.data.dto.DataResponseDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AppUserMultivalueDTO extends DataResponseDTO {

	private String fullUserName;

	public AppUserMultivalueDTO(org.demo.entity.AppUser entity) {
		this.id = entity.getId().toString();
		this.fullUserName = entity.getFullUserName();
	}

}

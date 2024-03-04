package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@NoArgsConstructor
public class ContactMultivalueDTO extends DataResponseDTO {

	private String fullName;

	public ContactMultivalueDTO(org.demo.entity.Contact entity) {
		this.id = entity.getId().toString();
		this.fullName = entity.getFullName();
	}

}

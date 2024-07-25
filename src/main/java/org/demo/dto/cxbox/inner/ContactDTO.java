package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.Contact;
import org.demo.microservice.core.querylang.common.SearchParameter;

@Getter
@Setter
@NoArgsConstructor
public class ContactDTO extends DataResponseDTO {

	@SearchParameter
	private String fullName;

	@SearchParameter
	private String phoneNumber;

	@SearchParameter
	private String email;

	public ContactDTO(Contact contact) {
		this.id = contact.getId().toString();
		this.fullName = contact.getFullName();
		this.phoneNumber = contact.getPhoneNumber();
		this.email = contact.getEmail();
	}

}

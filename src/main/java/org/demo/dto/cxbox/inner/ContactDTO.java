package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.demo.entity.Contact;

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

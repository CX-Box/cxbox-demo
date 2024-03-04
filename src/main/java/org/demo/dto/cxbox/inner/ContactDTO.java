package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.Contact;

@Getter
@Setter
@NoArgsConstructor
public class ContactDTO extends DataResponseDTO {

	private String fullName;

	private String phoneNumber;

	private String email;

	public ContactDTO(Contact contact) {
		this.id = contact.getId().toString();
		this.fullName = contact.getFullName();
		this.phoneNumber = contact.getPhoneNumber();
		this.email = contact.getEmail();
	}

}

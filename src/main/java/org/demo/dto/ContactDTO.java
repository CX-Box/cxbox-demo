package org.demo.dto;

import org.demo.entity.Contact;
import org.cxbox.api.data.dto.DataResponseDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

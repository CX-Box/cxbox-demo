package org.demo.dto;

import org.cxbox.api.data.dto.DataResponseDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;

@Getter
@Setter
@NoArgsConstructor
public class AppUserMultivalueDTO extends DataResponseDTO {

	private String fullUserName;

	@SearchParameter(name = "email", provider = StringValueProvider.class)
	private String email;

	public AppUserMultivalueDTO(org.demo.entity.AppUser entity) {
		this.id = entity.getId().toString();
		this.fullUserName = entity.getFullUserName();
		this.email = entity.getEmail();
	}

}

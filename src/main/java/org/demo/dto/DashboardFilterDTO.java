package org.demo.dto;

import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.model.core.entity.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DashboardFilterDTO extends DataResponseDTO {

	private MultivalueField fieldOfActivity;

	public DashboardFilterDTO(User user) {
		this.id = user.getId().toString();
	}

}

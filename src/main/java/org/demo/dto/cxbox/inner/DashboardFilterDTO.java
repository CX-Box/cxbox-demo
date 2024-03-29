package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.demo.entity.core.User;

@Getter
@Setter
@NoArgsConstructor
public class DashboardFilterDTO extends DataResponseDTO {

	private MultivalueField fieldOfActivity;

	public DashboardFilterDTO(User user) {
		this.id = user.getId().toString();
	}

}

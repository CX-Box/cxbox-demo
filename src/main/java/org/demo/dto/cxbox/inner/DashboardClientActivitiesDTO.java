package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.demo.entity.Client;

@Getter
@Setter
@NoArgsConstructor
public class DashboardClientActivitiesDTO extends DataResponseDTO {

	@SearchParameter(name = "fullName")
	private String clientName;

	private Long numberOfOpenActivities;

	public DashboardClientActivitiesDTO(Client client) {
		this.id = client.getId().toString();
		this.clientName = client.getFullName();
	}

}

package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.Client;

@Getter
@Setter
@NoArgsConstructor
public class DashboardClientActivitiesDTO extends DataResponseDTO {

	private String clientName;

	private Long numberOfOpenActivities;

	public DashboardClientActivitiesDTO(Client client) {
		this.id = client.getId().toString();
		this.clientName = client.getFullName();
	}

}

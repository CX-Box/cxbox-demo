package org.demo.dto;

import org.demo.entity.Client;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientImportance;
import org.demo.entity.enums.ClientStatus;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public abstract class ClientAbstractDTO extends DataResponseDTO {

	@SearchParameter(name = "fullName")
	private String fullName;

	@SearchParameter(name = "address")
	private String address;

	@SearchParameter(name = "importance", provider = EnumValueProvider.class)
	private ClientImportance importance;

	private ClientEditStep editStep;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private ClientStatus status;

	private String color;

	private String breif;

	private String breifId;

	ClientAbstractDTO(Client client) {
		this.id = client.getId().toString();
		this.address = client.getAddress();
		this.fullName = client.getFullName();
		this.importance = client.getImportance();
		this.editStep = client.getEditStep();
		this.status = client.getStatus();
		this.color = Optional.ofNullable(client.getImportance()).map(ClientImportance::getColor).orElse(null);
		this.breif = client.getBreif();
		this.breifId = client.getBreifId();
	}

}

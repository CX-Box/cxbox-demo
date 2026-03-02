package org.demo.dto.cxbox.inner;

import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DictionaryValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.demo.entity.Client;
import org.demo.entity.dictionary.ClientImportance;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientStatus;
import org.springframework.context.i18n.LocaleContextHolder;

@Getter
@Setter
@NoArgsConstructor
public abstract class ClientAbstractDTO extends DataResponseDTO {

	@SearchParameter(name = "fullName")
	private String fullName;

	@SearchParameter(name = "address")
	private String address;

	@SearchParameter(name = "importance", provider = DictionaryValueProvider.class)
	private ClientImportance importance;

	private ClientEditStep editStep;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private ClientStatus status;

	private String color;

	private String brief;

	private String briefId;

	private String filePreviewTitle = "My Lovely File";

	private String filePreviewHint = "ver nice!";

	ClientAbstractDTO(Client client) {
		this.id = client.getId().toString();
		this.address = client.getAddress();
		this.fullName = client.getFullName();
		this.importance = client.getImportance();
		this.status = client.getStatus();
		this.color = Optional.ofNullable(client.getImportance()).map(ClientImportance.colors::get).orElse(null);
		this.brief = client.getBrief();
		this.briefId = client.getBriefId();
		this.editStep = client.getEditStep();

	}

}

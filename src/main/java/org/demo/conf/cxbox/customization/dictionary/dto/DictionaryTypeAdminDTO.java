package org.demo.conf.cxbox.customization.dictionary.dto;

import org.cxbox.api.data.dto.DataResponseDTO;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.dictionary.entity.DictionaryTypeDesc;
import org.demo.microservice.core.querylang.common.SearchParameter;

@Getter
@Setter
@NoArgsConstructor
public class DictionaryTypeAdminDTO extends DataResponseDTO {

	@SearchParameter
	private String type;

	public DictionaryTypeAdminDTO(DictionaryTypeDesc entity) {
		this.id = entity.getId().toString();
		this.type = entity.getType();
	}

}

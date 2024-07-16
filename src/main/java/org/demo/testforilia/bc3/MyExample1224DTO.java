package org.demo.testforilia.bc3;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateValueProvider;

@Getter
@Setter
@NoArgsConstructor
public class MyExample1224DTO extends DataResponseDTO {

	private String customField;

	public MyExample1224DTO(MyEntity1224 entity) {
		this.id = entity.getId().toString();
		this.customField = entity.getCustomField();
	}

}
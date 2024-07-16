package org.demo.testforilia.bc4;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateValueProvider;

@Getter
@Setter
@NoArgsConstructor
public class MyExample1225DTO extends DataResponseDTO {

	private String customField;

	public MyExample1225DTO(MyEntity1225 entity) {
		this.id = entity.getId().toString();
		this.customField = entity.getCustomField();
	}

}
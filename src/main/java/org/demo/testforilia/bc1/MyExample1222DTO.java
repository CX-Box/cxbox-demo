package org.demo.testforilia.bc1;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@NoArgsConstructor
public class MyExample1222DTO extends DataResponseDTO {

	private String customField;

	public MyExample1222DTO(MyEntity1222 entity) {
		this.id = entity.getId().toString();
		this.customField = entity.getCustomField();
	}

}
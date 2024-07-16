package org.demo.testforilia.bc1parent;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@NoArgsConstructor
public class MyExample1223DTO extends DataResponseDTO {

	private String customField;

	public MyExample1223DTO(MyEntity1223 entity) {
		this.id = entity.getId().toString();
		this.customField = entity.getCustomField();
	}

}
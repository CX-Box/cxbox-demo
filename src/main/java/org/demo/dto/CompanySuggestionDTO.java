package org.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class CompanySuggestionDTO extends DataResponseDTO {

	private String value;

	private String address;

	public CompanySuggestionDTO(CompanySuggestionDTO entity) {
		this.id = entity.id;
		this.vstamp = entity.vstamp;
		this.value = entity.value;
		this.address = entity.address;
	}

}

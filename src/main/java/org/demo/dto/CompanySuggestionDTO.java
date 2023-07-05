package org.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.cxbox.api.data.dto.DataResponseDTO;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
public class CompanySuggestionDTO extends DataResponseDTO {

	private String value;

	private String address;

	@Builder
	public CompanySuggestionDTO(String id, String value, String address) {
		this.id = id;
		this.value = value;
		this.address = address;
	}

}

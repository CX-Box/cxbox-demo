package org.demo.conf.cxbox.customization.responsibilitiesAction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.api.data.dto.LocaleAware;

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class ActionSuggestionAdminDTO extends DataResponseDTO {

	private String value;

	@LocaleAware
	private String description;

	@LocaleAware
	private String text;
}

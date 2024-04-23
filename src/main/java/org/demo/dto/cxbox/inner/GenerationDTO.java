package org.demo.dto.cxbox.inner;

import static java.util.Optional.ofNullable;
import static org.demo.conf.cxbox.extension.multivaluePrimary.MultivalueExt.PRIMARY;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.Generation;
import org.demo.entity.enums.DetalizationEnum;
import org.demo.entity.enums.StyleEnum;

@Getter
@Setter
@NoArgsConstructor
public class GenerationDTO extends DataResponseDTO {

	private String name;

	@SearchParameter(name = "style", provider = EnumValueProvider.class)
	private StyleEnum style;

	@SearchParameter(name = "detalization", provider = EnumValueProvider.class)
	private DetalizationEnum detalization;

	@SearchParameter(name = "overridePrompt", provider = StringValueProvider.class)
	private String overridePrompt;

	public GenerationDTO(Generation entity) {
		this.id = entity.getId().toString();
		this.name = entity.getName();
		this.style = entity.getStyle();
		this.detalization = entity.getDetalization();
		this.overridePrompt = entity.getOverridePrompt();
	}


}

package org.demo.conf.cxbox.customization.responsibilitiesAction.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.meta.entity.ResponsibilitiesAction;

@SuppressWarnings("java:S1948")
@Getter
@Setter
@NoArgsConstructor
public class ResponsibilitiesActionAdminDTO extends DataResponseDTO {

	@SearchParameter
	private String internalRoleCD;

	private String bc;

	@SearchParameter(name = "action")
	private String actionKey;

	@SearchParameter()
	private String view;

	@SearchParameter()
	private String widget;

	public ResponsibilitiesActionAdminDTO(ResponsibilitiesAction entity) {
		this.id = entity.getId().toString();
		this.internalRoleCD = entity.getInternalRoleCD();
		this.actionKey = entity.getAction();
		this.view = entity.getView();
		this.widget = entity.getWidget();
	}

}

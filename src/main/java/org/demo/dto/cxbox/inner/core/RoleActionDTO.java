package org.demo.dto.cxbox.inner.core;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.demo.entity.core.RoleAction;

@SuppressWarnings("java:S1948")
@Getter
@Setter
@NoArgsConstructor
public class RoleActionDTO extends DataResponseDTO {

	@SearchParameter
	private String internalRoleCD;

	private String bc;

	@SearchParameter()
	private String action;

	@SearchParameter()
	private String view;

	@SearchParameter()
	private String widget;

	public RoleActionDTO(RoleAction entity) {
		this.id = entity.getId().toString();
		this.internalRoleCD = entity.getInternalRoleCD();
		this.action = entity.getAction();
		this.view = entity.getView();
		this.widget = entity.getWidget();
	}

}

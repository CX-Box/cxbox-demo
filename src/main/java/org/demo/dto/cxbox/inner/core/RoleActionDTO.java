package org.demo.dto.cxbox.inner.core;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DictionaryValueProvider;
import org.demo.entity.core.RoleAction;
import org.demo.entity.dictionary.InternalRole;

@SuppressWarnings("java:S1948")
@Getter
@Setter
@NoArgsConstructor
public class RoleActionDTO extends DataResponseDTO {

	@SearchParameter(provider = DictionaryValueProvider.class)
	private InternalRole internalRoleCD;

	private String bc;

	@SearchParameter()
	private String action;

	@SearchParameter()
	private String view;

	@SearchParameter()
	private String widget;

	public RoleActionDTO(RoleAction entity) {
		this.id = entity.getId().toString();
		this.internalRoleCD = new InternalRole(entity.getInternalRoleCD());
		this.action = entity.getAction();
		this.view = entity.getView();
		this.widget = entity.getWidget();
	}

}

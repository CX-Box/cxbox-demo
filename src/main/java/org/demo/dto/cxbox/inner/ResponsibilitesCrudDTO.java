package org.demo.dto.cxbox.inner;

import static org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType.INTERNAL_ROLE;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.LovValueProvider;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.demo.conf.cxbox.extension.lov.AdministeredDictionary;
import org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType;

@Getter
@Setter
@NoArgsConstructor
public class ResponsibilitesCrudDTO extends DataResponseDTO {

	@SearchParameter(provider = LovValueProvider.class)
	@AdministeredDictionary(AdministeredDictionaryType.INTERNAL_ROLE)
	private String internalRoleCD;

	private String screens;

	private String view;

	private ResponsibilityType respType;

	private boolean readOnly;

	private Long departmentId;

	public ResponsibilitesCrudDTO(Responsibilities responsibilities) {

		this.id = responsibilities.getId().toString();

		this.internalRoleCD = INTERNAL_ROLE.lookupValue(responsibilities.getInternalRoleCD());

		this.screens = responsibilities.getScreens();

		this.view = responsibilities.getView();

		this.respType = responsibilities.getResponsibilityType();

		this.readOnly = responsibilities.isReadOnly();

		this.departmentId = responsibilities.getDepartmentId();
	}

}

package org.demo.dto.cxbox.inner;

import static org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType.INTERNAL_ROLE;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.BooleanValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.LovValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.demo.conf.cxbox.extension.lov.AdministeredDictionary;
import org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType;

@SuppressWarnings("java:S1948")
@Getter
@Setter
@NoArgsConstructor
public class ResponsibilitesCrudDTO extends DataResponseDTO {

	@SearchParameter(provider = LovValueProvider.class)
	@AdministeredDictionary(AdministeredDictionaryType.INTERNAL_ROLE)
	private String internalRoleCD;

	private String screens;

	@SearchParameter(provider = StringValueProvider.class)
	private String view;

	@SearchParameter(name = "responsibilityType", provider = EnumValueProvider.class)
	private ResponsibilityType respType;

	@Deprecated
	@SearchParameter(provider = BooleanValueProvider.class)
	private boolean readOnly;

	/**
	 * This is complex computed column, so it is:
	 * (1) mapped in{@link  org.demo.service.cxbox.inner.ResponsibilitesService#entityToDto(BusinessComponent, Responsibilities) entityToDto}
	 * (2) filtered in{@link  org.demo.service.cxbox.inner.ResponsibilitesService#getSpecification(BusinessComponent) getSpecification}.
	 */
	@SearchParameter(suppressProcess = true)
	private MultivalueField viewWidgets;

	public ResponsibilitesCrudDTO(Responsibilities responsibilities) {
		this.id = responsibilities.getId().toString();
		this.internalRoleCD = INTERNAL_ROLE.lookupValue(responsibilities.getInternalRoleCD());
		this.screens = responsibilities.getScreens();
		this.view = responsibilities.getView();
		this.respType = responsibilities.getResponsibilityType();
		this.readOnly = responsibilities.isReadOnly();
	}

}

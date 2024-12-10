package org.demo.conf.cxbox.customization.responsibilities.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.cxbox.meta.entity.Responsibilities;
import org.demo.conf.cxbox.customization.responsibilities.service.ResponsibilitiesAdminService;

@SuppressWarnings("java:S1948")
@Getter
@Setter
@NoArgsConstructor
public class ResponsibilitiesAdminDTO extends DataResponseDTO {

	@SearchParameter
	private String internalRoleCD;

	@SearchParameter(provider = StringValueProvider.class)
	private String view;

	/**
	 * This is complex computed column, so it is:
	 * (1) mapped in{@link  ResponsibilitiesAdminService#entityToDto(BusinessComponent, Responsibilities) entityToDto}
	 * (2) filtered in{@link  ResponsibilitiesAdminService#getSpecification(BusinessComponent) getSpecification}.
	 */
	@SearchParameter(suppressProcess = true)
	private MultivalueField viewWidgets;

	public ResponsibilitiesAdminDTO(Responsibilities responsibilities) {
		this.id = responsibilities.getId().toString();
		this.internalRoleCD = responsibilities.getInternalRoleCD();
		this.view = responsibilities.getView();
	}

}

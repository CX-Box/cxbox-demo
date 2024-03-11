package org.demo.service.cxbox.inner;

import static org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType.INTERNAL_ROLE;
import static org.demo.dto.cxbox.inner.MeetingDTO_.agenda;

import org.apache.commons.lang3.StringUtils;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.demo.dto.cxbox.inner.ResponsibilitesCreateDTO;
import org.demo.dto.cxbox.inner.ResponsibilitesCreateDTO_;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ResponsibilitesService extends VersionAwareResponseService<ResponsibilitesCreateDTO, Responsibilities> {

	public ResponsibilitesService() {
		super(ResponsibilitesCreateDTO.class, Responsibilities.class, null, ResponsibilitesMeta.class);
	}

	@Override
	protected CreateResult<ResponsibilitesCreateDTO> doCreateEntity(Responsibilities entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<ResponsibilitesCreateDTO> doUpdateEntity(Responsibilities entity, ResponsibilitesCreateDTO data,
			BusinessComponent bc) {
		setIfChanged(data, ResponsibilitesCreateDTO_.departmentId, entity::setDepartmentId);
		setIfChanged(data, ResponsibilitesCreateDTO_.view, entity::setView);
		setIfChanged(data, ResponsibilitesCreateDTO_.screens, entity::setScreens);
		setIfChanged(data, ResponsibilitesCreateDTO_.respType, entity::setResponsibilityType);
		setIfChanged(data, ResponsibilitesCreateDTO_.readOnly, entity::setReadOnly);

		setMappedIfChanged(data, ResponsibilitesCreateDTO_.internalRoleCD, entity::setInternalRoleCD, val -> {
			if (StringUtils.isNotBlank(val)) {
				return INTERNAL_ROLE.lookupName(val);
			} else {
				return null;
			}
		});
		return null;
	}


}

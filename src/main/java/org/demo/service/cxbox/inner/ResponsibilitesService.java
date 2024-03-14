package org.demo.service.cxbox.inner;

import static org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType.INTERNAL_ROLE;


import org.apache.commons.lang3.StringUtils;

import org.cxbox.api.MetaHotReloadService;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;

import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;

import org.cxbox.core.service.action.Actions;
import org.cxbox.meta.entity.Responsibilities;

import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO;


import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO_;
import org.demo.repository.ResponsibilitiesRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ResponsibilitesService extends VersionAwareResponseService<ResponsibilitesCrudDTO, Responsibilities> {

	@Autowired
	private ResponsibilitiesRepository resposibilitiesRepository;


	public ResponsibilitesService() {
		super(ResponsibilitesCrudDTO.class, Responsibilities.class, null, ResponsibilitesMeta.class);
	}

	@Override
	protected CreateResult<ResponsibilitesCrudDTO> doCreateEntity(Responsibilities entity, BusinessComponent bc) {
		entity.setResponsibilityType(ResponsibilityType.VIEW);
		entity.setDepartmentId(0L);
		resposibilitiesRepository.save(entity);

		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<ResponsibilitesCrudDTO> doUpdateEntity(Responsibilities entity,
			ResponsibilitesCrudDTO data,
			BusinessComponent bc) {
		setIfChanged(data, ResponsibilitesCrudDTO_.view, entity::setView);
		setIfChanged(data, ResponsibilitesCrudDTO_.screens, entity::setScreens);
		setIfChanged(data, ResponsibilitesCrudDTO_.respType, entity::setResponsibilityType);
		setIfChanged(data, ResponsibilitesCrudDTO_.readOnly, entity::setReadOnly);

		setMappedIfChanged(data, ResponsibilitesCrudDTO_.internalRoleCD, entity::setInternalRoleCD, val -> {
			if (StringUtils.isNotBlank(val)) {
				return INTERNAL_ROLE.lookupName(val);
			} else {
				return null;
			}
		});

		resposibilitiesRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));

	}

	@Override
	public Actions<ResponsibilitesCrudDTO> getActions() {
		return Actions.<ResponsibilitesCrudDTO>builder()
				.create().text("Add").add()
				.save().add()
				.delete().text("Delete").add()
				.newAction()
				.action("edit", "Edit")
				.add()
				.build();
	}

}

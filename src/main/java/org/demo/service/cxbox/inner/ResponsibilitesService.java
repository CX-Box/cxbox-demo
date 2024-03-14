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
import org.demo.dto.cxbox.inner.ResponsibilitesCreateDTO;
import org.demo.dto.cxbox.inner.ResponsibilitesCreateDTO_;

import org.demo.repository.ResponsibilitiesRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ResponsibilitesService extends VersionAwareResponseService<ResponsibilitesCreateDTO, Responsibilities> {

	@Autowired
	private ResponsibilitiesRepository resposibilitiesRepository;

	private final MetaHotReloadService metaHotReloadService;

	public ResponsibilitesService(MetaHotReloadService metaHotReloadService) {
		super(ResponsibilitesCreateDTO.class, Responsibilities.class, null, ResponsibilitesMeta.class);
		this.metaHotReloadService = metaHotReloadService;
	}

	@Override
	protected CreateResult<ResponsibilitesCreateDTO> doCreateEntity(Responsibilities entity, BusinessComponent bc) {
		entity.setResponsibilityType(ResponsibilityType.VIEW);
		entity.setDepartmentId(0L);
		resposibilitiesRepository.save(entity);

		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<ResponsibilitesCreateDTO> doUpdateEntity(Responsibilities entity,
			ResponsibilitesCreateDTO data,
			BusinessComponent bc) {
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

		resposibilitiesRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));

	}

	@Override
	public Actions<ResponsibilitesCreateDTO> getActions() {
		return Actions.<ResponsibilitesCreateDTO>builder()
				.create().text("Add").add()
				.save().add()
				.delete().text("Delete").add()
				.newAction()
				.action("edit", "Edit")
				.add()
				.newAction()
				.action("refresh", "Refresh")
				.invoker((bc, data) -> {
					metaHotReloadService.loadMeta();
					return new ActionResultDTO<>();
				})
				.available(bc -> true).withAutoSaveBefore()
				.add()
				.build();
	}

}

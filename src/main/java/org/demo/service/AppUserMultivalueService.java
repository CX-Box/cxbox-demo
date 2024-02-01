package org.demo.service;

import lombok.Getter;
import org.demo.dto.AppUserMultivalueDTO_;
import org.springframework.stereotype.Service;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;


@Getter
@Service
public class AppUserMultivalueService extends
		VersionAwareResponseService<org.demo.dto.AppUserMultivalueDTO, org.demo.entity.AppUser> {

	public AppUserMultivalueService() {
		super(org.demo.dto.AppUserMultivalueDTO.class, org.demo.entity.AppUser.class, null, AppUserMultivalueMeta.class);
	}

	@Override
	protected CreateResult<org.demo.dto.AppUserMultivalueDTO> doCreateEntity(org.demo.entity.AppUser entity,
			BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<org.demo.dto.AppUserMultivalueDTO> doUpdateEntity(org.demo.entity.AppUser entity,
			org.demo.dto.AppUserMultivalueDTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(AppUserMultivalueDTO_.email)) {
			entity.setEmail(data.getEmail());
		}
		return null;
	}


}
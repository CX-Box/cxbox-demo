package org.demo.service;

import lombok.Getter;
import org.cxbox.model.core.entity.User;
import org.demo.dto.UserPickDTO;
import org.springframework.stereotype.Service;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;


@Getter
@Service
public class UserPickService extends VersionAwareResponseService<UserPickDTO, User> {

	public UserPickService() {
		super(UserPickDTO.class, User.class, null, UserPickMeta.class);
	}

	@Override
	protected CreateResult<UserPickDTO> doCreateEntity(User entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<UserPickDTO> doUpdateEntity(User entity, UserPickDTO data,
			BusinessComponent bc) {
		return null;
	}


}
package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.UserDTO;
import org.demo.entity.core.User;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class UserPickService extends VersionAwareResponseService<UserDTO, User> {

	@Getter(onMethod_ = @Override)
	private final Class<UserPickMeta> meta = UserPickMeta.class;

	@Override
	protected CreateResult<UserDTO> doCreateEntity(User entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<UserDTO> doUpdateEntity(User entity, UserDTO data, BusinessComponent bc) {
		return null;
	}

}

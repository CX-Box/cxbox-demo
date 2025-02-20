package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.ResponsibleDTO;
import org.demo.entity.core.User;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class ResponsiblePickListService extends VersionAwareResponseService<ResponsibleDTO, User> {

	@Getter(onMethod_ = @Override)
	private final Class<ResponsiblePickListMeta> meta = ResponsiblePickListMeta.class;

	@Override
	protected CreateResult<ResponsibleDTO> doCreateEntity(User entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<ResponsibleDTO> doUpdateEntity(User entity, ResponsibleDTO data,
			BusinessComponent bc) {
		return null;
	}


}

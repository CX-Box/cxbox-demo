package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.DeptDTO;
import org.demo.entity.core.Dept;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class DeptPickService extends VersionAwareResponseService<DeptDTO, Dept> {

	@Getter(onMethod_ = @Override)
	private final Class<DeptPickMeta> meta = DeptPickMeta.class;

	@Override
	protected CreateResult<DeptDTO> doCreateEntity(Dept entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<DeptDTO> doUpdateEntity(Dept entity, DeptDTO data, BusinessComponent bc) {
		return null;
	}

}

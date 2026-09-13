package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.OrgStructureDTO;
import org.demo.entity.OrgStructure;
import org.springframework.stereotype.Service;

/**
 * Read only org structure tree, used to pick a responsible person or a parent node.
 */
@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class OrgStructureReadService extends VersionAwareResponseService<OrgStructureDTO, OrgStructure> {

	@Getter(onMethod_ = @Override)
	private final Class<OrgStructureReadMeta> meta = OrgStructureReadMeta.class;

	@Override
	protected CreateResult<OrgStructureDTO> doCreateEntity(OrgStructure entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<OrgStructureDTO> doUpdateEntity(OrgStructure entity, OrgStructureDTO data,
			BusinessComponent bc) {
		return null;
	}

}

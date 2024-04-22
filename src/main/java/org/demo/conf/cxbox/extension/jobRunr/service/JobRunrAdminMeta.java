package org.demo.conf.cxbox.extension.jobRunr.service;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobRunrAdminDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobRunrAdminMeta extends AnySourceFieldMetaBuilder<JobRunrAdminDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<JobRunrAdminDTO> fields, BcDescription bc,
			String id, String parentId) {

	}


	@Override
	public void buildIndependentMeta(FieldsMeta<JobRunrAdminDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}

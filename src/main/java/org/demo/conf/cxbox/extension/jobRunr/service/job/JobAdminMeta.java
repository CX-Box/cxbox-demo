package org.demo.conf.cxbox.extension.jobRunr.service.job;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobAdminDTO;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobAdminDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobAdminMeta extends AnySourceFieldMetaBuilder<JobAdminDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<JobAdminDTO> fields, BcDescription bc,
			String id, String parentId) {

	}


	@Override
	public void buildIndependentMeta(FieldsMeta<JobAdminDTO> fields, BcDescription bcDescription,
			String parentId) {
		fields.enableSort(
				JobAdminDTO_.id,
				JobAdminDTO_.state,
				JobAdminDTO_.jobasjson,
				JobAdminDTO_.createdat,
				JobAdminDTO_.updatedat,
				JobAdminDTO_.scheduledat,
				JobAdminDTO_.recurringjobid,
				JobAdminDTO_.version,
				JobAdminDTO_.jobsignature
		);
	}

}

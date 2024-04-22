package org.demo.conf.cxbox.extension.jobRunr.service;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobRunrAdminDTO;
import org.springframework.stereotype.Service;

@Service
public class JobRunrAdminService extends AnySourceVersionAwareResponseService<JobRunrAdminDTO, JobRunrAdminDTO> {

	public JobRunrAdminService() {
		super(JobRunrAdminDTO.class, JobRunrAdminDTO.class, JobRunrAdminMeta.class, JobRunrAdminDao.class);
	}

	@Override
	protected CreateResult<JobRunrAdminDTO> doCreateEntity(JobRunrAdminDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<JobRunrAdminDTO> doUpdateEntity(JobRunrAdminDTO entity, JobRunrAdminDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

}

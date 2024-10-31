package org.demo.conf.cxbox.extension.jobRunr.service.job;

import java.util.UUID;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobAdminDTO;
import org.demo.controller.CxboxRestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JobAdminService extends AnySourceVersionAwareResponseService<JobAdminDTO, JobAdminDTO> {

	@Autowired
	private JobAdminDao jobAdminDao;

	public JobAdminService() {
		super(JobAdminDTO.class, JobAdminDTO.class, JobAdminMeta.class, JobAdminDao.class);
	}

	@Override
	protected CreateResult<JobAdminDTO> doCreateEntity(JobAdminDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<JobAdminDTO> doUpdateEntity(JobAdminDTO entity, JobAdminDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Actions<JobAdminDTO> getActions() {

		return Actions.<JobAdminDTO>builder()
				.action(act -> act
						.action("requeue", "requeue")
						.invoker((bc, dto) -> {
							jobAdminDao.requeueJobById(UUID.fromString(bc.getId()));
							return new ActionResultDTO<JobAdminDTO>().setAction(PostAction.refreshBc(CxboxRestController.jobsStats));
						})
				)
				.action(act -> act
						.action("delete", "delete")
						.invoker((bc, dto) -> {
							jobAdminDao.deleteJobById(UUID.fromString(bc.getId()));
							return new ActionResultDTO<JobAdminDTO>().setAction(PostAction.refreshBc(CxboxRestController.jobsStats));
						})
				)
				.build();
	}

}

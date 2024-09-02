package org.demo.conf.cxbox.extension.jobRunr.service.state;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO;
import org.demo.controller.CxboxRestController;
import org.springframework.stereotype.Service;

@Service
public class JobStatsService extends AnySourceVersionAwareResponseService<JobStatsDTO, JobStatsDTO> {

	public JobStatsService() {
		super(JobStatsDTO.class, JobStatsDTO.class, JobStatsMeta.class, JobStatsDao.class);
	}

	@Override
	protected CreateResult<JobStatsDTO> doCreateEntity(JobStatsDTO entity, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	protected ActionResultDTO<JobStatsDTO> doUpdateEntity(JobStatsDTO entity, JobStatsDTO data, BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Actions<JobStatsDTO> getActions() {

		return Actions.<JobStatsDTO>builder()
				.newAction()
				.action("refresh", "Refresh")
				.invoker((bc, dto) -> {
					return new ActionResultDTO<JobStatsDTO>().setAction(PostAction.refreshBc(CxboxRestController.jobsStats));
				})
				.add()
				.build();
	}
}

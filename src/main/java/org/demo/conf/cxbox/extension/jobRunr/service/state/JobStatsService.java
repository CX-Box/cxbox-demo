package org.demo.conf.cxbox.extension.jobRunr.service.state;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO;
import org.demo.controller.CxboxRestController;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Service
public class JobStatsService extends AnySourceVersionAwareResponseService<JobStatsDTO, JobStatsDTO> {

	@Getter
	private final Class<JobStatsMeta> metaBuilder = JobStatsMeta.class;

	@Getter
	private final Class<JobStatsDao> anySourceBaseDAOClass = JobStatsDao.class;

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
				.action(act -> act
						.action("refresh", "Refresh")
						.invoker((bc, dto) -> {
							return new ActionResultDTO<JobStatsDTO>().setAction(PostAction.refreshBc(CxboxRestController.jobsStats));
						})
				)
				.build();
	}
}

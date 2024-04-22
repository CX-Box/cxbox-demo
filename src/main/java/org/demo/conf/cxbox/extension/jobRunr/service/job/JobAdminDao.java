package org.demo.conf.cxbox.extension.jobRunr.service.job;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobAdminDTO;
import org.demo.conf.cxbox.extension.jobRunr.enums.JobStatsStateEnum;
import org.jobrunr.jobs.Job;
import org.jobrunr.jobs.states.StateName;
import org.jobrunr.storage.StorageProvider;
import org.jobrunr.storage.navigation.OffsetBasedPageRequest;
import org.jobrunr.utils.mapper.JsonMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobAdminDao extends AbstractAnySourceBaseDAO<JobAdminDTO> implements
		AnySourceBaseDAO<JobAdminDTO> {

	private final JdbcTemplate jdbcTemplate;

	private final JsonMapper jsonMapper;

	private final StorageProvider storageProvider;

	@Override
	public String getId(final JobAdminDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final JobAdminDTO entity) {
		entity.setId(id);
	}

	@Override
	public JobAdminDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getJobById(bc.getId());
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<JobAdminDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		JobStatsStateEnum state = JobStatsStateEnum.getByBc(bc);
		if (state == null) {
			return new PageImpl<>(new ArrayList<>());
		}
		return new PageImpl<>(getJobs(state.getStateName(), 10));
	}

	@Override
	public JobAdminDTO update(BusinessComponent bc, JobAdminDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public JobAdminDTO create(final BusinessComponent bc, final JobAdminDTO entity) {
		throw new IllegalStateException();
	}

	private JobAdminDTO getJobById(String id) {
		return map(storageProvider.getJobById(UUID.fromString(id)));
	}

	public void deleteJobById(UUID id) {
		final Job job = storageProvider.getJobById(id);
		job.delete("Job deleted via Dashboard");
		storageProvider.save(job);
	}

	public void requeueJobById(UUID id) {
		final Job job = storageProvider.getJobById(id);
		job.enqueue();
		storageProvider.save(job);
	}

	@NonNull
	private List<JobAdminDTO> getJobs(StateName stateName, int limit) {
		return findJobByState(stateName, limit).stream().map(this::map).collect(Collectors.toList());
	}

	private List<Job> findJobByState(StateName stateName, int limit) {
		return storageProvider.getJobs(
				stateName,
				new OffsetBasedPageRequest(null, OffsetBasedPageRequest.DEFAULT_OFFSET, limit)
		).getItems();
	}

	private JobAdminDTO map(Job job) {
		ZoneId zone = ZoneId.of("America/Edmonton");
		return JobAdminDTO.builder()
				.id(job.getId().toString())
				.version((long) job.getVersion())
				.jobasjson(jsonMapper.serialize(job.getJobDetails()))
				.jobsignature(job.getJobSignature())
				.state(job.getState().toString())
				.createdat(LocalDateTime.ofInstant(job.getCreatedAt(), zone))
				.updatedat(LocalDateTime.ofInstant(job.getUpdatedAt(), zone))
				.scheduledat(null)
				.recurringjobid(job.getRecurringJobId().orElse(null))
				.build();
	}

}

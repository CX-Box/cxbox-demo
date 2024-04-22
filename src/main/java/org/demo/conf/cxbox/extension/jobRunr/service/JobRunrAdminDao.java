package org.demo.conf.cxbox.extension.jobRunr.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobRunrAdminDTO;
import org.jobrunr.dashboard.server.http.handlers.HttpRequestHandler;
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
public class JobRunrAdminDao extends AbstractAnySourceBaseDAO<JobRunrAdminDTO> implements
		AnySourceBaseDAO<JobRunrAdminDTO> {

	private final JdbcTemplate jdbcTemplate;

	private final JsonMapper jsonMapper;

	private final StorageProvider storageProvider;

	@Override
	public String getId(final JobRunrAdminDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final JobRunrAdminDTO entity) {
		entity.setId(id);
	}

	@Override
	public JobRunrAdminDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getJobs(10).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<JobRunrAdminDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getJobs(10));
	}

	@Override
	public JobRunrAdminDTO update(BusinessComponent bc, JobRunrAdminDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public JobRunrAdminDTO create(final BusinessComponent bc, final JobRunrAdminDTO entity) {
		throw new IllegalStateException();
	}

	private HttpRequestHandler getJobById() {
		return (request, response) -> response.asJson(storageProvider.getJobById(request.param(":id", UUID.class)));
	}

	private HttpRequestHandler deleteJobById() {
		return (request, response) -> {
			final Job job = storageProvider.getJobById(request.param(":id", UUID.class));
			job.delete("Job deleted via Dashboard");
			storageProvider.save(job);
			response.statusCode(204);
		};
	}

	private HttpRequestHandler requeueJobById() {
		return (request, response) -> {
			final Job job = storageProvider.getJobById(request.param(":id", UUID.class));
			job.enqueue();
			storageProvider.save(job);
			response.statusCode(204);
		};
	}

	@NonNull
	private List<JobRunrAdminDTO> getJobs(int limit) {
		return findJobByState(StateName.SCHEDULED, limit).stream().map(this::map).collect(Collectors.toList());
	}


	private List<Job> findJobByState(StateName stateName, int limit) {
		return storageProvider.getJobs(
				stateName,
				new OffsetBasedPageRequest(null, OffsetBasedPageRequest.DEFAULT_OFFSET, limit)
		).getItems();
	}

	/*return jdbcTemplate.<JobRunrAdminDTO>query(
				"select id, version, jobasjson, jobsignature, state, createdat,updatedat, scheduledat, recurringjobid from jobrunr_jobs where state = 'SCHEDULED' ORDER BY updatedAt ASC LIMIT 10",
				new JobRunrAdminDTORowMapper()
		);*/

	private JobRunrAdminDTO map(Job job) {
		ZoneId zone = ZoneId.of("America/Edmonton");
		return JobRunrAdminDTO.builder()
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

	/*private static class JobRunrAdminDTORowMapper implements RowMapper<JobRunrAdminDTO> {

		@Override
		public JobRunrAdminDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
			return JobRunrAdminDTO.builder()
					.id(rs.getString("id"))
					.version(rs.getLong("version"))
					.jobasjson(rs.getString("jobasjson"))
					.jobsignature(rs.getString("jobsignature"))
					.state(rs.getString("state"))
					.createdat(rs.getTimestamp("createdat").toLocalDateTime())
					.updatedat(rs.getTimestamp("updatedat").toLocalDateTime())
					.scheduledat(rs.getTimestamp("scheduledat").toLocalDateTime())
					.recurringjobid(rs.getString("recurringjobid"))
					.build();
		}

	}*/

}

package org.demo.conf.cxbox.extension.jobRunr.service.state;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO;
import org.demo.conf.cxbox.extension.jobRunr.enums.JobStatsStateEnum;
import org.jobrunr.jobs.states.StateName;
import org.jobrunr.storage.StorageProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobStatsDao extends AbstractAnySourceBaseDAO<JobStatsDTO> implements
		AnySourceBaseDAO<JobStatsDTO> {

	private final StorageProvider storageProvider;

	@Override
	public String getId(final JobStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final JobStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public JobStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStates().stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<JobStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStates());
	}

	private List<JobStatsDTO> getStates() {
		return Arrays.stream(JobStatsStateEnum.values()).map(s -> JobStatsDTO.builder()
						.id(JobStatsStateEnum.mapToId(s))
						.title(s.getValue())
						.value(countJobByState(s.getStateName()))
						.color(s.getColor())
						.description(s.getValue())
						.icon(s.getIcon())
						.build())
				.collect(Collectors.toList());
	}

	@Override
	public JobStatsDTO update(BusinessComponent bc, JobStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public JobStatsDTO create(final BusinessComponent bc, final JobStatsDTO entity) {
		throw new IllegalStateException();
	}

	public Long countJobByState(StateName stateName) {
		return storageProvider.countJobs(
				stateName
		);
	}
}

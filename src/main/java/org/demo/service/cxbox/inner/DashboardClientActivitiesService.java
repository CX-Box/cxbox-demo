

package org.demo.service.cxbox.inner;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.util.Set;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.DashboardClientActivitiesDTO;
import org.demo.entity.Client;
import org.demo.entity.Client_;
import org.demo.entity.DashboardFilter;
import org.demo.entity.DashboardFilter_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.DashboardFilterRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class DashboardClientActivitiesService extends VersionAwareResponseService<DashboardClientActivitiesDTO, Client> {

	private final DashboardFilterRepository dashboardFilterRepository;

	@Getter(onMethod_ = {@Override})
	private final Class<DashboardClientActivitiesMeta> meta = DashboardClientActivitiesMeta.class;

	@Override
	protected Specification<Client> getSpecification(BusinessComponent bc) {
		return super.getSpecification(bc).and(getFilterSpecification(bc));
	}

	private Specification<Client> getFilterSpecification(BusinessComponent bc) {
		DashboardFilter dashboardFilter = dashboardFilterRepository.findOne(
				(root, cq, cb) -> cb.equal(root.get(
						DashboardFilter_.userId), bc.getParentIdAsLong())
		).orElse(null);
		if (dashboardFilter == null) {
			return (root, cq, cb) -> cb.and();
		}
		Set<FieldOfActivity> filteredActivities = dashboardFilter.getFieldOfActivities();
		if (filteredActivities.isEmpty()) {
			return (root, cq, cb) -> cb.and();
		}
		return (root, cq, cb) -> {
			Join<Client, FieldOfActivity> activitiesJoin = root.join(Client_.fieldOfActivities, JoinType.INNER);
			return activitiesJoin.in(filteredActivities);
		};
	}

	@Override
	protected CreateResult<DashboardClientActivitiesDTO> doCreateEntity(Client entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<DashboardClientActivitiesDTO> doUpdateEntity(Client entity, DashboardClientActivitiesDTO data,
			BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected DashboardClientActivitiesDTO entityToDto(BusinessComponent bc, Client entity) {
		DashboardClientActivitiesDTO dto = super.entityToDto(bc, entity);
		dto.setNumberOfOpenActivities((long) entity.getFieldOfActivities().size());
		return dto;
	}

}


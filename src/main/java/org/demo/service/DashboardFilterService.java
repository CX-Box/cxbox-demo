

package org.demo.service;

import org.demo.dto.DashboardFilterDTO;
import org.demo.dto.DashboardFilterDTO_;
import org.demo.entity.DashboardFilter;
import org.demo.entity.DashboardFilter_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.DashboardFilterRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.util.session.SessionService;
import org.cxbox.model.core.entity.User;
import org.cxbox.model.core.entity.User_;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class
DashboardFilterService extends VersionAwareResponseService<DashboardFilterDTO, User> {

	@Autowired
	private SessionService sessionService;

	@Autowired
	private DashboardFilterRepository dashboardFilterRepository;

	public DashboardFilterService() {
		super(DashboardFilterDTO.class, User.class, null, DashboardFilterMeta.class);
	}

	@Override
	public long count(BusinessComponent bc) {
		return 1L;
	}

	@Override
	protected Specification<User> getSpecification(BusinessComponent bc) {
		sessionService.getSessionUser().getId();
		Specification<User> filterSpecification = (root, cq, cb) -> cb.equal(
				root.get(User_.id),
				sessionService.getSessionUser().getId()
		);
		return super.getSpecification(bc).and(filterSpecification);

	}

	@Override
	protected CreateResult<DashboardFilterDTO> doCreateEntity(User entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<DashboardFilterDTO> doUpdateEntity(User entity, DashboardFilterDTO data,
			BusinessComponent bc) {
		DashboardFilter filter = dashboardFilterRepository.findOne((root, cq, cb) -> cb.equal(
				root.get(DashboardFilter_.userId),
				sessionService.getSessionUser().getId()
		)).orElse(null);
		if (filter == null) {
			filter = new DashboardFilter();
			filter.setUserId(sessionService.getSessionUser().getId());
			dashboardFilterRepository.save(filter);
		}
		if (data.isFieldChanged(DashboardFilterDTO_.fieldOfActivity)) {
			filter.setFieldOfActivities(
					data.getFieldOfActivity().getValues()
							.stream()
							.map(v -> FieldOfActivity.getByValue(v.getValue()))
							.collect(Collectors.toSet()));
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	protected DashboardFilterDTO entityToDto(BusinessComponent bc, User entity) {
		DashboardFilterDTO dto = super.entityToDto(bc, entity);
		dashboardFilterRepository.findOne(
				(root, cq, cb) -> cb.equal(root.get(DashboardFilter_.userId), sessionService.getSessionUser().getId())
		).ifPresent(dashboardFilter -> dto.setFieldOfActivity(dashboardFilter.getFieldOfActivities()
				.stream()
				.collect(MultivalueField.toMultivalueField(
						Enum::name,
						FieldOfActivity::getValue
				))));
		return dto;
	}

	@Override
	public Actions<DashboardFilterDTO> getActions() {

		return Actions.<DashboardFilterDTO>builder()
				.action("filter", "Apply Filters")
				.invoker((bc, dto) -> new ActionResultDTO<>())
				.available(bc -> true).withAutoSaveBefore()
				.add()
				.build();
	}

}



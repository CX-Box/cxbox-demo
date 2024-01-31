package org.demo.service;

import java.util.List;
import java.util.Objects;
import javax.persistence.EntityManager;
import org.cxbox.api.data.ResultPage;
import org.cxbox.core.dto.multivalue.MultivalueFieldSingleValue;
import org.demo.dto.DashboardFilterDTO;
import org.demo.dto.DashboardFilterDTO_;
import org.demo.entity.AppUser;
import org.demo.entity.DashboardFilter;
import org.demo.entity.DashboardFilter_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.MemberTypesEnum;
import org.demo.entity.enums.TaskResolutionsEnum;
import org.demo.entity.enums.TaskStatusesEnum;
import org.demo.entity.enums.TaskTypesEnum;
import org.demo.repository.AppUserRepository;
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
DashboardFilterService extends VersionAwareResponseService<DashboardFilterDTO, DashboardFilter> {

	@Autowired
	private SessionService sessionService;

	@Autowired
	private DashboardFilterRepository dashboardFilterRepository;

	@Autowired
	private AppUserRepository appUserRepository;

	@Autowired
	private EntityManager entityManager;

	public DashboardFilterService() {
		super(DashboardFilterDTO.class, DashboardFilter.class, null, DashboardFilterMeta.class);
	}


	@Override
	protected Specification<DashboardFilter> getSpecification(BusinessComponent bc) {
		sessionService.getSessionUser().getId();
		Specification<DashboardFilter> filterSpecification = (root, cq, cb) -> cb.equal(
				root.get(DashboardFilter_.user).get(User_.id),
				sessionService.getSessionUser().getId()
		);
		return super.getSpecification(bc).and(filterSpecification);

	}

	@Override
	protected CreateResult<DashboardFilterDTO> doCreateEntity(DashboardFilter entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<DashboardFilterDTO> doUpdateEntity(DashboardFilter entity, DashboardFilterDTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(DashboardFilterDTO_.taskResolutions)) {
			entity.setTaskResolutions(
					data.getTaskResolutions().getValues()
							.stream()
							.map(v -> TaskResolutionsEnum.getByValue(v.getValue()))
							.map(Enum::name)
							.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(DashboardFilterDTO_.taskTypes)) {
			entity.setTaskTypes(
					data.getTaskTypes().getValues()
							.stream()
							.map(v -> TaskTypesEnum.getByValue(v.getValue()))
							.map(Enum::name)
							.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(DashboardFilterDTO_.startDateTimeTo)) {
			entity.setStartDateTimeTo(data.getStartDateTimeTo());
		}
		if (data.isFieldChanged(DashboardFilterDTO_.startDateTimeFrom)) {
			entity.setStartDateTimeFrom(data.getStartDateTimeFrom());
		}
		if (data.isFieldChanged(DashboardFilterDTO_.endDateTimeTo)) {
			entity.setEndDateTimeTo(data.getEndDateTimeTo());
		}
		if (data.isFieldChanged(DashboardFilterDTO_.endDateTimeFrom)) {
			entity.setEndDateTimeFrom(data.getEndDateTimeFrom());
		}
		if (data.isFieldChanged(DashboardFilterDTO_.registratinDateTo)) {
			entity.setRegistratinDateTo(data.getRegistratinDateTo());
		}
		if (data.isFieldChanged(DashboardFilterDTO_.registratinDateFrom)) {
			entity.setRegistratinDateFrom(data.getRegistratinDateFrom());
		}
		if (data.isFieldChanged(DashboardFilterDTO_.members)) {
			entity.getMembersList().clear();
			entity.getMembersList().addAll(data.getMembers().getValues().stream()
					.map(MultivalueFieldSingleValue::getId)
					.filter(Objects::nonNull)
					.map(Long::parseLong)
					.map(e -> entityManager.getReference(AppUser.class, e))
					.collect(Collectors.toList()));
		}
		if (data.isFieldChanged(DashboardFilterDTO_.memberTypes)) {
			entity.setMemberTypes(
					data.getMemberTypes().getValues()
							.stream()
							.map(v -> MemberTypesEnum.getByValue(v.getValue()))
							.map(Enum::name)
							.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(DashboardFilterDTO_.taskStatuses)) {
			entity.setTaskStatuses(
					data.getTaskStatuses().getValues()
							.stream()
							.map(v -> TaskStatusesEnum.getByValue(v.getValue()))
							.map(Enum::name)
							.collect(Collectors.joining(",", ",", ",")));
		}
		if (data.isFieldChanged(DashboardFilterDTO_.taskId)) {
			entity.setTaskId(data.getTaskId());
		}
		DashboardFilter filter = dashboardFilterRepository.findOne((root, cq, cb) -> cb.equal(
				root.get(DashboardFilter_.user).get(User_.id),
				sessionService.getSessionUser().getId()
		)).orElse(null);
		if (filter == null) {
			filter = new DashboardFilter();
			Long userId = sessionService.getSessionUser().getId();
			filter.setUser(appUserRepository.getById(userId));
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
	protected DashboardFilterDTO entityToDto(BusinessComponent bc, DashboardFilter entity) {
		DashboardFilterDTO dto = super.entityToDto(bc, entity);
		dashboardFilterRepository.findOne(
				(root, cq, cb) -> cb.equal(
						root.get(DashboardFilter_.user).get(User_.id),
						sessionService.getSessionUser().getId()
				)
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
				.action("filter", "Найти задачу")
				.invoker((bc, dto) -> new ActionResultDTO<>())
				.available(bc -> true).withAutoSaveBefore()
				.add()

				.action("getNewTask", "Получить новую задачу")
				.invoker((bc, dto) -> new ActionResultDTO<>())
				.available(bc -> true).withAutoSaveBefore()
				.add()

				.build();
	}

}



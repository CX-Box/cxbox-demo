package org.demo.dto;

import com.google.common.base.Splitter;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateTimeValueProvider;
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.AppUser;
import org.demo.entity.DashboardFilter;
import org.demo.entity.enums.MemberTypesEnum;
import org.demo.entity.enums.TaskResolutionsEnum;
import org.demo.entity.enums.TaskStatusesEnum;
import org.demo.entity.enums.TypeEnum;

@Getter
@Setter
@NoArgsConstructor
public class DashboardFilterDTO extends DataResponseDTO {

	private MultivalueField fieldOfActivity;

	@SearchParameter(name = "taskId", provider = StringValueProvider.class)
	private String taskId;

	@SearchParameter(name = "taskStatuses", multiFieldKey = StringValueProvider.class)
	private MultivalueField taskStatuses;

	@SearchParameter(name = "memberTypes", multiFieldKey = StringValueProvider.class)
	private MultivalueField memberTypes;

	@SearchParameter(name = "membersList.id", provider = LongValueProvider.class)
	private MultivalueField members;

	private String membersDisplayedKey;

	@SearchParameter(name = "registratinDateFrom", provider = DateTimeValueProvider.class)
	private LocalDateTime registratinDateFrom;

	@SearchParameter(name = "registratinDateTo", provider = DateTimeValueProvider.class)
	private LocalDateTime registratinDateTo;

	@SearchParameter(name = "endDateTimeFrom", provider = DateTimeValueProvider.class)
	private LocalDateTime endDateTimeFrom;

	@SearchParameter(name = "endDateTimeTo", provider = DateTimeValueProvider.class)
	private LocalDateTime endDateTimeTo;

	@SearchParameter(name = "startDateTimeFrom", provider = DateTimeValueProvider.class)
	private LocalDateTime startDateTimeFrom;

	@SearchParameter(name = "startDateTimeTo", provider = DateTimeValueProvider.class)
	private LocalDateTime startDateTimeTo;

	@SearchParameter(name = "taskTypes", multiFieldKey = StringValueProvider.class)
	private MultivalueField taskTypes;

	@SearchParameter(name = "taskResolutions", multiFieldKey = StringValueProvider.class)
	private MultivalueField taskResolutions;

	public DashboardFilterDTO(DashboardFilter user) {
		this.id = user.getId().toString();
		this.taskId = user.getTaskId();
		this.taskStatuses = Optional.ofNullable(user.getTaskStatuses())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(TaskStatusesEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, TaskStatusesEnum::getValue)))
				.orElse(null);
		this.memberTypes = Optional.ofNullable(user.getMemberTypes())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(MemberTypesEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, MemberTypesEnum::getValue)))
				.orElse(null);
		this.members = user.getMembersList().stream().collect(MultivalueField.toMultivalueField(
				e -> String.valueOf(e.getId()),
				AppUser::getFullUserName
		));
		this.membersDisplayedKey = StringUtils.abbreviate(user.getMembersList().stream().map(AppUser::getFullUserName
		).collect(Collectors.joining(",")), 12);
		this.registratinDateFrom = user.getRegistratinDateFrom();
		this.registratinDateTo = user.getRegistratinDateTo();
		this.endDateTimeFrom = user.getEndDateTimeFrom();
		this.endDateTimeTo = user.getEndDateTimeTo();
		this.startDateTimeFrom = user.getStartDateTimeFrom();
		this.startDateTimeTo = user.getStartDateTimeTo();
		this.taskTypes = Optional.ofNullable(user.getTaskTypes())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(TypeEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, TypeEnum::getValue)))
				.orElse(null);
		this.taskResolutions = Optional.ofNullable(user.getTaskResolutions())
				.map(el -> Splitter.on(",").trimResults().omitEmptyStrings().splitToList(el).stream()
						.map(TaskResolutionsEnum::valueOf)
						.collect(MultivalueField.toMultivalueField(Enum::name, TaskResolutionsEnum::getValue)))
				.orElse(null);
	}

}

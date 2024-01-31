package org.demo.service;

import org.demo.dto.DashboardFilterDTO;
import org.demo.dto.DashboardFilterDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import java.util.Arrays;
import org.demo.entity.enums.MemberTypesEnum;
import org.demo.entity.enums.TaskResolutionsEnum;
import org.demo.entity.enums.TaskStatusesEnum;
import org.demo.entity.enums.TaskTypesEnum;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class DashboardFilterMeta extends FieldMetaBuilder<DashboardFilterDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardFilterDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setDictionaryTypeWithCustomValues(
				DashboardFilterDTO_.taskResolutions,
				Arrays.stream(TaskResolutionsEnum.values())
						.map(TaskResolutionsEnum::getValue)
						.toArray(String[]::new)
		);
		fields.setEnabled(DashboardFilterDTO_.taskResolutions);
		fields.setDictionaryTypeWithCustomValues(DashboardFilterDTO_.taskTypes, Arrays.stream(TaskTypesEnum.values())
				.map(TaskTypesEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(DashboardFilterDTO_.taskTypes);
		fields.setEnabled(DashboardFilterDTO_.startDateTimeTo);
		fields.setEnabled(DashboardFilterDTO_.startDateTimeFrom);
		fields.setEnabled(DashboardFilterDTO_.endDateTimeTo);
		fields.setEnabled(DashboardFilterDTO_.endDateTimeFrom);
		fields.setEnabled(DashboardFilterDTO_.registratinDateTo);
		fields.setEnabled(DashboardFilterDTO_.registratinDateFrom);
		fields.setEnabled(DashboardFilterDTO_.members);
		fields.setDictionaryTypeWithCustomValues(DashboardFilterDTO_.memberTypes, Arrays.stream(MemberTypesEnum.values())
				.map(MemberTypesEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(DashboardFilterDTO_.memberTypes);
		fields.setDictionaryTypeWithCustomValues(DashboardFilterDTO_.taskStatuses, Arrays.stream(TaskStatusesEnum.values())
				.map(TaskStatusesEnum::getValue)
				.toArray(String[]::new));
		fields.setEnabled(DashboardFilterDTO_.taskStatuses);
		fields.setEnabled(DashboardFilterDTO_.taskId);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardFilterDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(DashboardFilterDTO_.taskResolutions);
		fields.enableFilter(DashboardFilterDTO_.taskTypes);
		fields.enableFilter(DashboardFilterDTO_.startDateTimeTo);
		fields.enableFilter(DashboardFilterDTO_.startDateTimeFrom);
		fields.enableFilter(DashboardFilterDTO_.endDateTimeTo);
		fields.enableFilter(DashboardFilterDTO_.endDateTimeFrom);
		fields.enableFilter(DashboardFilterDTO_.registratinDateTo);
		fields.enableFilter(DashboardFilterDTO_.registratinDateFrom);
		fields.enableFilter(DashboardFilterDTO_.members);
		fields.enableFilter(DashboardFilterDTO_.memberTypes);
		fields.enableFilter(DashboardFilterDTO_.taskStatuses);
		fields.enableFilter(DashboardFilterDTO_.taskId);
		fields.setEnabled(
				DashboardFilterDTO_.fieldOfActivity
		);
		fields.setDictionaryTypeWithCustomValues(
				DashboardFilterDTO_.fieldOfActivity,
				Arrays.stream(FieldOfActivity.values())
						.map(FieldOfActivity::getValue)
						.toArray(String[]::new)
		);
		fields.setForceActive(DashboardFilterDTO_.fieldOfActivity);
	}

}

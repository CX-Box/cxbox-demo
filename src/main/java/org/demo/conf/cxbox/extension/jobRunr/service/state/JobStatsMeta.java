package org.demo.conf.cxbox.extension.jobRunr.service.state;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO_;
import org.demo.conf.cxbox.extension.jobRunr.enums.JobStatsStateEnum;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JobStatsMeta extends AnySourceFieldMetaBuilder<JobStatsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<JobStatsDTO> fields, BcDescription bc,
			String id, String parentId) {
		JobStatsStateEnum state = JobStatsStateEnum.getById(id);
		fields.setDrilldown(
				JobStatsDTO_.value,
				DrillDownType.INNER,
				"/screen/admin/view/" + state.getAdminView()
		);
	}


	@Override
	public void buildIndependentMeta(FieldsMeta<JobStatsDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}

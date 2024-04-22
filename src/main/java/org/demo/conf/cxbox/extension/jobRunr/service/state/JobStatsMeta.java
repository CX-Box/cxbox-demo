package org.demo.conf.cxbox.extension.jobRunr.service.state;

import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.INACTIVE_CLIENTS_ID;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.IN_PROGRESS_CLIENTS;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.NEW_CLIENTS_ID;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO;
import org.demo.conf.cxbox.extension.jobRunr.dto.JobStatsDTO_;
import org.demo.conf.cxbox.extension.jobRunr.enums.JobStatsStateEnum;
import org.demo.entity.enums.ClientStatus;
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

	private String getStatusFilterValues(@NonNull String id) {
		if (NEW_CLIENTS_ID.equals(id)) {
			return ClientStatus.NEW.getValue();
		} else if (INACTIVE_CLIENTS_ID.equals(id)) {
			return ClientStatus.INACTIVE.getValue();
		} else if (IN_PROGRESS_CLIENTS.equals(id)) {
			return ClientStatus.IN_PROGRESS.getValue();
		}
		throw new IllegalStateException("Unexpected value: " + id);
	}


	@Override
	public void buildIndependentMeta(FieldsMeta<JobStatsDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}

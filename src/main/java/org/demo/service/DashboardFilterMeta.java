package org.demo.service;

import org.demo.dto.DashboardFilterDTO;
import org.demo.dto.DashboardFilterDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import java.util.Arrays;
import org.springframework.stereotype.Service;

@Service
public class DashboardFilterMeta extends FieldMetaBuilder<DashboardFilterDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardFilterDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardFilterDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
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

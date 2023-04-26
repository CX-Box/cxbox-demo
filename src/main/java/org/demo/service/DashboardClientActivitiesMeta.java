package org.demo.service;

import org.demo.dto.DashboardClientActivitiesDTO;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class DashboardClientActivitiesMeta extends FieldMetaBuilder<DashboardClientActivitiesDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardClientActivitiesDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardClientActivitiesDTO> fields, InnerBcDescription bcDescription, Long parentId) {

	}

}

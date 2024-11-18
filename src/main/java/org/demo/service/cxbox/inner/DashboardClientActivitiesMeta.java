package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.DashboardClientActivitiesDTO;
import org.demo.dto.cxbox.inner.DashboardClientActivitiesDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class DashboardClientActivitiesMeta extends FieldMetaBuilder<DashboardClientActivitiesDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardClientActivitiesDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setDrilldown(DashboardClientActivitiesDTO_.clientName, DrillDownType.INNER,"/screen/client/view/clientlist/" + CxboxRestController.client + "/" + id);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardClientActivitiesDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.enableFilter(DashboardClientActivitiesDTO_.clientName);
		fields.enableSort(DashboardClientActivitiesDTO_.clientName);
	}

}

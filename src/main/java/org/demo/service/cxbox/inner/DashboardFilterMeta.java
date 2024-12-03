package org.demo.service.cxbox.inner;

import java.util.Arrays;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.DashboardFilterDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class DashboardFilterMeta extends FieldMetaBuilder<DashboardFilterDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardFilterDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				DashboardFilterDTO_.fieldOfActivity
		);
		fields.setConcreteValues(
				DashboardFilterDTO_.fieldOfActivity,
				Arrays.stream(FieldOfActivity.values())
						.map(e -> new SimpleDictionary(e.name(), e.getValue()))
						.toList()
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardFilterDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {

		fields.setForceActive(DashboardFilterDTO_.fieldOfActivity);
	}

}

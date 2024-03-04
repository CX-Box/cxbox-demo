package org.demo.service.cxbox.external.lov;



import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.ExternalFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.LovDTO;
import org.demo.dto.LovDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LovReadMeta extends ExternalFieldMetaBuilder<LovDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<LovDTO> fields, BcDescription bc,
			String id, String parentId) {
		fields.setEnabled(
				LovDTO_.value,
				LovDTO_.descriptionText,
				LovDTO_.typeName,
				LovDTO_.code,
				LovDTO_.orderBy,
				LovDTO_.inactiveFlag,
				LovDTO_.externalCode,
				LovDTO_.additionalParameter1,
				LovDTO_.additionalParameter2
		);

		fields.setDrilldown(
				LovDTO_.code,
				DrillDownType.INNER,
				"/screen/admin/view/lovUpdateExternal/" + CxboxRestController.lovExternal + "/" + id
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<LovDTO> fields, BcDescription bcDescription,
			String parentId) {
		fields.setForceActive(LovDTO_.additionalParameter1);
		fields.setForceActive(LovDTO_.additionalParameter2);
		fields.enableFilter(LovDTO_.code);
		fields.enableFilter(LovDTO_.value);
	}

}

package org.demo.service.lov;

import static org.demo.dto.LovDTO_.additionalParameter1;
import static org.demo.dto.LovDTO_.additionalParameter2;
import static org.demo.dto.LovDTO_.childs;
import static org.demo.dto.LovDTO_.code;
import static org.demo.dto.LovDTO_.descriptionText;
import static org.demo.dto.LovDTO_.externalCode;
import static org.demo.dto.LovDTO_.inactiveFlag;
import static org.demo.dto.LovDTO_.orderBy;
import static org.demo.dto.LovDTO_.typeName;
import static org.demo.dto.LovDTO_.value;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.ExternalFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.LovDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LovExternalReadMeta extends ExternalFieldMetaBuilder<LovDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<LovDTO> fields, BcDescription bc,
			String id, String parentId) {
		fields.setEnabled(
				value,
				descriptionText,
				typeName,
				code,
				orderBy,
				inactiveFlag,
				externalCode,
				additionalParameter1,
				additionalParameter2,
				childs
		);

		fields.setDrilldown(
				code,
				DrillDownType.INNER,
				"/screen/admin/view/lovUpdateExternal/" + CxboxRestController.lovExternal + "/" + id
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<LovDTO> fields, BcDescription bcDescription,
			String parentId) {
		fields.setForceActive(additionalParameter1);
		fields.setForceActive(additionalParameter2);
		fields.enableFilter(code);
		fields.enableFilter(value);
	}

}

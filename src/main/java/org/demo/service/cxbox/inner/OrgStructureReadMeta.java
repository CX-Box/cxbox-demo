package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.OrgStructureDTO;
import org.demo.dto.cxbox.inner.OrgStructureDTO_;
import org.demo.entity.enums.OrgStructureType;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class OrgStructureReadMeta extends FieldMetaBuilder<OrgStructureDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<OrgStructureDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(OrgStructureDTO_.fullName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<OrgStructureDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(OrgStructureDTO_.parentId);

		fields.enableFilter(OrgStructureDTO_.type);
		fields.setEnumFilterValues(fields, OrgStructureDTO_.type, OrgStructureType.values());

		fields.enableFilter(OrgStructureDTO_.deptCode);
		fields.enableFilter(OrgStructureDTO_.userLogin);

		fields.enableFilter(OrgStructureDTO_.fullName);
		fields.enableSort(OrgStructureDTO_.fullName);
	}

}

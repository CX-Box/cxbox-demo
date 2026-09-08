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
public class OrgStructureWriteMeta extends FieldMetaBuilder<OrgStructureDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<OrgStructureDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		boolean user = OrgStructureType.USER.equals(fields.getCurrentValue(OrgStructureDTO_.type).orElse(null));

		// isFieldChangedNow field value updates - first
		if (fields.isFieldChangedNow(fields, OrgStructureDTO_.type)) {
			if (user) {
				fields.setCurrentValue(OrgStructureDTO_.deptId, null);
				fields.setCurrentValue(OrgStructureDTO_.deptFullName, null);
			} else {
				fields.setCurrentValue(OrgStructureDTO_.userId, null);
				fields.setCurrentValue(OrgStructureDTO_.userFullName, null);
			}
		}

		// any other meta - next
		fields.setEnabled(OrgStructureDTO_.parentId);
		fields.setEnabled(OrgStructureDTO_.parentName);

		fields.setEnabled(OrgStructureDTO_.type);
		fields.setEnumValues(OrgStructureDTO_.type, OrgStructureType.values());

		if (user) {
			fields.setEnabled(OrgStructureDTO_.userId);
			fields.setEnabled(OrgStructureDTO_.userFullName);
			fields.setHidden(OrgStructureDTO_.deptFullName);
		} else {
			fields.setEnabled(OrgStructureDTO_.deptId);
			fields.setEnabled(OrgStructureDTO_.deptFullName);
			fields.setHidden(OrgStructureDTO_.userFullName);
		}
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<OrgStructureDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		// the type drives which reference is shown, so its change must refresh the row meta
		fields.setForceActive(OrgStructureDTO_.type);

		fields.enableFilter(OrgStructureDTO_.parentId);

		fields.enableFilter(OrgStructureDTO_.type);
		fields.setEnumFilterValues(fields, OrgStructureDTO_.type, OrgStructureType.values());

		fields.enableFilter(OrgStructureDTO_.deptCode);
		fields.enableFilter(OrgStructureDTO_.userLogin);

		fields.enableFilter(OrgStructureDTO_.fullName);
		fields.enableSort(OrgStructureDTO_.fullName);
	}

}

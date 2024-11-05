package org.demo.service.cxbox.inner;

import java.util.List;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO_;
import org.demo.entity.enums.Briefings;
import org.demo.entity.enums.Documents;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingDocumentsWriteMeta extends FieldMetaBuilder<MeetingDocumentsDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDocumentsDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setEnabled(MeetingDocumentsDTO_.fileId);
		fields.setEnabled(MeetingDocumentsDTO_.file);
		fields.setEnabled(MeetingDocumentsDTO_.notes);
		fields.setEnabled(MeetingDocumentsDTO_.briefing);
		fields.setEnabled(MeetingDocumentsDTO_.document);
		fields.setEnumValues(MeetingDocumentsDTO_.briefing, Briefings.values());
		fields.setEnumValues(MeetingDocumentsDTO_.document, Documents.values());
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingDocumentsDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(MeetingDocumentsDTO_.file);
		fields.enableSort(MeetingDocumentsDTO_.file);
		fields.setFileAccept(MeetingDocumentsDTO_.file, List.of(".png", ".pdf", ".jpg", ".jpeg"));
		fields.enableSort(MeetingDocumentsDTO_.document);
		fields.enableSort(MeetingDocumentsDTO_.briefing);
		fields.enableSort(MeetingDocumentsDTO_.id);
		fields.enableSort(MeetingDocumentsDTO_.notes);
		fields.setAllValuesWithIcons(MeetingDocumentsDTO_.document,Documents.iconMap());
		fields.defaultGroupingHierarchy(
				MeetingDocumentsDTO_.document,
				MeetingDocumentsDTO_.briefing,
				lvl -> lvl
						.addWithCfg(
								Documents.POLICY,
								cfg -> cfg.defaultExpanded(true),
								lvl2 -> lvl2
										.add(Briefings.PROJECT)
										.add(Briefings.SECURITY)
						)
						.add(
								Documents.COMPLIANCE
						)
		);
	}

}

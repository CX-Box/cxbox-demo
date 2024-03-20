package org.demo.service.cxbox.inner;

import java.util.List;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingDocumentsWriteMeta extends FieldMetaBuilder<MeetingDocumentsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDocumentsDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MeetingDocumentsDTO_.fileId);
		fields.setEnabled(MeetingDocumentsDTO_.file);
		fields.setEnabled(
				MeetingDocumentsDTO_.notes);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingDocumentsDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(MeetingDocumentsDTO_.file);
		fields.setFileAccept(MeetingDocumentsDTO_.file, List.of(".png",".pdf",".jpg",".jpeg"));

	}

}
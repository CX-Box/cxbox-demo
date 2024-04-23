package org.demo.service.cxbox.inner;

import java.util.List;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.GenerationDocumentsDTO;
import org.demo.dto.cxbox.inner.GenerationDocumentsDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class GenerationDocumentsWriteMeta extends FieldMetaBuilder<GenerationDocumentsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<GenerationDocumentsDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(GenerationDocumentsDTO_.fileId);
		fields.setEnabled(GenerationDocumentsDTO_.file);
		fields.setEnabled(
				GenerationDocumentsDTO_.notes);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<GenerationDocumentsDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(GenerationDocumentsDTO_.file);
		fields.setFileAccept(GenerationDocumentsDTO_.file, List.of(".png",".pdf",".jpg",".jpeg"));

	}

}
package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.GenerationDocuments;
import org.demo.entity.MeetingDocuments;

@Getter
@Setter
@NoArgsConstructor
public class GenerationDocumentsDTO extends DataResponseDTO {

	private String notes;

	@SearchParameter(name = "file", provider = StringValueProvider.class)
	private String file;

	private String fileId;

	private String type;

	private String fieldKeyForBase64;

	private String fieldKeyForContentType;

	public GenerationDocumentsDTO(GenerationDocuments entity) {
		this.id = entity.getId().toString();
		this.notes = entity.getNotes();
		this.file = entity.getFile();
		this.fileId = entity.getFileId();
		this.fieldKeyForBase64 = entity.getFieldKeyForBase64() != null ? new String(entity.getFieldKeyForBase64()) : null;
		this.fieldKeyForContentType = entity.getFieldKeyForContentType();
	}


}

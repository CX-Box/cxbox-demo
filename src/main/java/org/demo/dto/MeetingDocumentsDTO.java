package org.demo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.MeetingDocuments;

@Getter
@Setter
@NoArgsConstructor
public class MeetingDocumentsDTO extends DataResponseDTO {

	private String notes;

	@SearchParameter(name = "file", provider = StringValueProvider.class)
	private String file;

	private String fileId;

	private String type;

	private String fieldKeyForBase64;

	private String fieldKeyForContentType;

	public MeetingDocumentsDTO(MeetingDocuments meeting) {
		this.id = meeting.getId().toString();
		this.notes = meeting.getNotes();
		this.file = meeting.getFile();
		this.fileId = meeting.getFileId();
		this.fieldKeyForBase64 = meeting.getFieldKeyForBase64() != null ? meeting.getFieldKeyForBase64().toString() : null;
		this.fieldKeyForContentType = meeting.getFieldKeyForContentType();
	}

}

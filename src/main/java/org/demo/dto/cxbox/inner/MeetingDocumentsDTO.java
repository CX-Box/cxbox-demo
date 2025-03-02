package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.dictionary.Briefings;
import org.demo.entity.enums.Documents;

@Getter
@Setter
@NoArgsConstructor
public class MeetingDocumentsDTO extends DataResponseDTO {

	private String notes;

	@SearchParameter(name = "file", provider = StringValueProvider.class)
	private String file;

	private String fileId;

	private String type;

	@SearchParameter(name = "briefing", provider = EnumValueProvider.class)
	private Briefings briefing;

	@SearchParameter(name = "document", provider = EnumValueProvider.class)
	private Documents document;

	public MeetingDocumentsDTO(MeetingDocuments meeting) {
		this.id = meeting.getId().toString();
		this.notes = meeting.getNotes();
		this.file = meeting.getFile();
		this.fileId = meeting.getFileId();
		this.briefing = meeting.getBriefing();
		this.document = meeting.getDocument();
	}


}

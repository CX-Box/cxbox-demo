package org.demo.dto.cxbox.inner;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.BigDecimalValueProvider;
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

	@Min(value = 1, message = "Priority cannot be lower than 1")
	@Max(value = 5, message = "Priority cannot be higher than 5")
	@SearchParameter(name = "priority", provider = BigDecimalValueProvider.class)
	private Long priority;

	public MeetingDocumentsDTO(MeetingDocuments meeting) {
		this.id = meeting.getId().toString();
		this.notes = meeting.getNotes();
		this.file = meeting.getFile();
		this.fileId = meeting.getFileId();
		this.briefing = meeting.getBriefing();
		this.document = meeting.getDocument();
		this.priority = meeting.getPriority();
	}


}

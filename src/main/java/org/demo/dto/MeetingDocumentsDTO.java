package org.demo.dto;

import static java.util.Optional.ofNullable;
import static org.demo.conf.cxbox.core.multivaluePrimary.MultivalueExt.PRIMARY;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateTimeValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.MultiFieldValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.cxbox.model.core.entity.BaseEntity;
import org.cxbox.model.core.entity.User;
import org.demo.conf.cxbox.core.multivaluePrimary.MultivalueExt;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.enums.MeetingStatus;

@Getter
@Setter
@NoArgsConstructor
public class MeetingDocumentsDTO extends DataResponseDTO {

	private String notes;

	@SearchParameter(name = "file", provider = StringValueProvider.class)
	private String file;

	private String fileId;

	public MeetingDocumentsDTO(MeetingDocuments meeting) {
		this.id = meeting.getId().toString();
		this.notes = meeting.getNotes();
		this.file = meeting.getFile();
		this.fileId = meeting.getFileId();
	}


}

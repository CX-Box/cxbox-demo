package org.demo.dto;

import static java.util.Optional.ofNullable;

import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateTimeValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.model.core.entity.BaseEntity;
import org.cxbox.model.core.entity.User;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MeetingDTO extends DataResponseDTO {

	@SearchParameter(name = "agenda")
	private String agenda;

	@SearchParameter(name = "startDateTime", provider = DateTimeValueProvider.class)
	private LocalDateTime startDateTime;

	private LocalDateTime endDateTime;

	private String period;

	@SearchParameter(name = "status", provider = EnumValueProvider.class)
	private MeetingStatus status;

	@SearchParameter(name = "address")
	private String address;

	private String notes;

	private String result;

	private Long responsibleId;

	@SearchParameter(name = "responsible.fullName")
	private String responsibleName;

	@SearchParameter(name = "client.fullName")
	private String clientName;

	private Long clientId;

	private Long contactId;

	@SearchParameter(name = "contact.fullName")
	private String contactName;

	public MeetingDTO(Meeting meeting) {
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy hh:mm");

		this.id = meeting.getId().toString();
		this.agenda = meeting.getAgenda();
		this.startDateTime = meeting.getStartDateTime();
		this.endDateTime = meeting.getEndDateTime();
		this.period = ofNullable(meeting.getStartDateTime()).map(dateTimeFormatter::format).orElse("")
				+ " - " + ofNullable(meeting.getEndDateTime()).map(dateTimeFormatter::format).orElse("");
		this.address = meeting.getAddress();
		this.status = meeting.getStatus();
		this.notes = meeting.getNotes();
		this.result = meeting.getResult();
		this.responsibleName = ofNullable(meeting.getResponsible()).map(User::getFullName).orElse(null);
		this.responsibleId = ofNullable(meeting.getResponsible()).map(User::getId).orElse(null);
		this.clientName = ofNullable(meeting.getClient()).map(Client::getFullName).orElse(null);
		this.clientId = ofNullable(meeting.getClient()).map(BaseEntity::getId).orElse(null);
		this.contactId = ofNullable(meeting.getContact()).map(BaseEntity::getId).orElse(null);
		this.contactName = ofNullable(meeting.getContact()).map(Contact::getFullName).orElse(null);
	}

}

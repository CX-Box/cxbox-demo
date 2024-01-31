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
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.cxbox.core.util.filter.provider.impl.MultiFieldValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.cxbox.model.core.entity.BaseEntity;
import org.cxbox.model.core.entity.User;
import org.demo.conf.cxbox.core.multivaluePrimary.MultivalueExt;
import org.demo.entity.Client;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.demo.entity.enums.ProcessEnum;
import org.demo.entity.enums.ResolutionEnum;
import org.demo.entity.enums.TypeEnum;

@Getter
@Setter
@NoArgsConstructor
public class MeetingDTO extends DataResponseDTO {

	private String link;

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

	@SearchParameter(name = "additionalContacts.id", multiFieldKey = MultiFieldValueProvider.class)
	private MultivalueField additionalContacts;

	private String additionalContactsDisplayedKey;

	@SearchParameter(name = "object", provider = StringValueProvider.class)
	private String object;

	@SearchParameter(name = "type", provider = EnumValueProvider.class)
	private TypeEnum type;

	@SearchParameter(name = "resolution", provider = EnumValueProvider.class)
	private ResolutionEnum resolution;

	@SearchParameter(name = "registratinDate", provider = DateTimeValueProvider.class)
	private LocalDateTime registratinDate;

	@SearchParameter(name = "customerEntity.fullUserName", provider = StringValueProvider.class)
	private String customer;

	@SearchParameter(name = "customerEntity.id", provider = LongValueProvider.class)
	private Long customerId;

	@SearchParameter(name = "curatorEntity.fullUserName", provider = StringValueProvider.class)
	private String curator;

	@SearchParameter(name = "curatorEntity.id", provider = LongValueProvider.class)
	private Long curatorId;

	@SearchParameter(name = "process", provider = EnumValueProvider.class)
	private ProcessEnum process;

	@SearchParameter(name = "slaDate", provider = DateTimeValueProvider.class)
	private LocalDateTime slaDate;

	@SearchParameter(name = "description", provider = StringValueProvider.class)
	private String description;

	public MeetingDTO(Meeting meeting) {
		DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy hh:mm");

		this.id = meeting.getId().toString();
		this.link = "\uD83D\uDD89";
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

		this.additionalContacts = meeting.getAdditionalContacts().stream().collect(MultivalueExt.toMultivalueField(
				e -> String.valueOf(e.getId()),
				Contact::getFullName,
				Map.of(
						PRIMARY,
						field -> Objects.equals(field.getId(), meeting.getAdditionalContactPrimaryId()) ? Boolean.TRUE.toString()
								: null
				)
		));
		this.additionalContactsDisplayedKey = StringUtils.abbreviate(meeting.getAdditionalContacts().stream()
				.map(Contact::getFullName
				).collect(Collectors.joining(",")), 12);
		this.object = meeting.getObject();
		this.type = meeting.getType();
		this.resolution = meeting.getResolution();
		this.registratinDate = meeting.getRegistratinDate();
		this.customerId = ofNullable(meeting.getCustomerEntity())
				.map(e -> e.getId())
				.orElse(null);
		this.customer = ofNullable(meeting.getCustomerEntity())
				.map(e -> e.getFullUserName())
				.orElse(null);

		this.curatorId = ofNullable(meeting.getCuratorEntity())
				.map(e -> e.getId())
				.orElse(null);
		this.curator = ofNullable(meeting.getCuratorEntity())
				.map(e -> e.getFullUserName())
				.orElse(null);
		this.process = meeting.getProcess();
		this.slaDate = meeting.getSlaDate();
		this.description = meeting.getDescription();
	}


}

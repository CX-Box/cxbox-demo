package org.demo.dto.cxbox.inner;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.DateTimeValueProvider;
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.demo.conf.cxbox.extension.multivaluePrimary.MultivalueExt;
import org.demo.entity.CalendarYearMeeting;
import org.demo.entity.Client;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class CalendarYearMeetingDTO extends DataResponseDTO {

	private String value;

	@SearchParameter(name = "eventDate", provider = DateTimeValueProvider.class)
	private LocalDateTime startDateTime;

	@SearchParameter(name = "eventDate", provider = DateTimeValueProvider.class)
	private LocalDateTime endDateTime;

	@SearchParameter(name = "clients.id", provider = LongValueProvider.class)
	private MultivalueField clients;

	private String clientsDisplayName;

	public CalendarYearMeetingDTO(CalendarYearMeeting calendarYearMeeting) {
		this.id = Optional.ofNullable(calendarYearMeeting).map(CalendarYearMeeting::getId).map(String::valueOf).orElse(null);
		this.value = Optional.ofNullable(calendarYearMeeting).map(CalendarYearMeeting::getEventsCount).map(c -> c + " events")
				.orElse(null);
		this.startDateTime = Optional.ofNullable(calendarYearMeeting).map(CalendarYearMeeting::getEventDate)
				.map(ed -> LocalDateTime.of(ed.toLocalDate(), LocalTime.MIDNIGHT)).orElse(null);
		this.endDateTime = Optional.ofNullable(calendarYearMeeting).map(CalendarYearMeeting::getEventDate)
				.map(ed -> LocalDateTime.of(ed.toLocalDate(), LocalTime.MAX)).orElse(null);

		this.clients = Optional.ofNullable(calendarYearMeeting)
				.map(CalendarYearMeeting::getClients).stream()
				.flatMap(Collection::stream)
				.collect(MultivalueExt.toMultivalueField(
						e -> String.valueOf(e.getId()),
						Client::getFullName,
						Map.of()
				));
		this.clientsDisplayName = StringUtils.abbreviate(
				Optional.ofNullable(calendarYearMeeting)
						.map(CalendarYearMeeting::getClients).stream()
						.flatMap(Collection::stream)
						.map(Client::getFullName)
						.collect(Collectors.joining(",")), 12
		);
	}

}

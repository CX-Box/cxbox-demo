package org.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "v_calendar_year_meeting")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
@Immutable
public class CalendarYearMeeting extends BaseEntity {

	@Column(name = "event_date")
	private LocalDateTime eventDate;

	@Column(name = "events_count")
	private Long eventsCount;

	@ManyToMany
	@JoinTable(
			name = "v_meetings_clients",
			joinColumns = @JoinColumn(name = "meeting_day_id"),
			inverseJoinColumns = @JoinColumn(name = "client_id")
	)
	@JsonIgnoreProperties("meetingDays")
	private Set<Client> clients = new HashSet<>();

}

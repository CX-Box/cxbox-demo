package org.demo.entity;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import lombok.EqualsAndHashCode;
import org.demo.entity.enums.MeetingStatus;
import org.cxbox.model.core.entity.BaseEntity;
import org.cxbox.model.core.entity.User;
import java.time.LocalDateTime;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "MEETING")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Meeting extends BaseEntity {

	private String agenda;

	private LocalDateTime startDateTime = LocalDateTime.now();

	private LocalDateTime endDateTime = LocalDateTime.now();

	@Enumerated(EnumType.STRING)
	private MeetingStatus status = MeetingStatus.NOT_STARTED;

	private String address;

	private String notes;

	private String result;

	@ManyToOne
	@JoinColumn(name = "RESPONSIBLE_ID")
	private User responsible;

	@ManyToOne
	@JoinColumn(name = "CONTACT_ID")
	private Contact contact;

	@ManyToOne
	@JoinColumn(name = "CLIENT_ID")
	private Client client;

	private Long additionalContactPrimaryId;

	@JoinTable(name = "Meeting_Contact",
			joinColumns = @JoinColumn(name = "Meeting_id"),
			inverseJoinColumns = @JoinColumn(name = "Contact_id")
	)
	@ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	private List<Contact> additionalContacts = new ArrayList<>();

}

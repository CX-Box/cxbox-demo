package org.demo.entity;

import jakarta.persistence.ManyToMany;
import lombok.EqualsAndHashCode;
import org.demo.entity.dictionary.ClientImportance;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.cxbox.model.core.entity.BaseEntity;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "CLIENT")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Client extends BaseEntity {

	private String fullName;

	private String address;

	@ElementCollection(targetClass = FieldOfActivity.class)
	@CollectionTable(name = "FIELD_OF_ACTIVITY", joinColumns = @JoinColumn(name = "CLIENT_ID"))
	@Column(name = "VALUE", nullable = false)
	@Enumerated(EnumType.STRING)
	private Set<FieldOfActivity> fieldOfActivities = new HashSet<>();

	@ManyToMany(mappedBy = "clients")
	private Set<Contact> contacts = new HashSet<>();

	@OneToMany(mappedBy = "client")
	private Set<Meeting> meetings = new HashSet<>();

	private ClientImportance importance = ClientImportance.LOW;

	@Enumerated(value = EnumType.STRING)
	private ClientStatus status = ClientStatus.NEW;

	@Enumerated(value = EnumType.STRING)
	private ClientEditStep editStep = ClientEditStep.FILL_GENERAL_INFORMATION;

	private String brief;

	private String briefId;

}

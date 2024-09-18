package org.demo.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;
import lombok.EqualsAndHashCode;
import org.cxbox.model.core.entity.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "CONTACT")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class Contact extends BaseEntity {

	@JoinTable(name = "Client_Contact",
			joinColumns = @JoinColumn(name = "Contact_id"),
			inverseJoinColumns = @JoinColumn(name = "Client_id")
	)
	@ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	private Set<Client> clients = new HashSet<>();

	private String fullName;

	private String phoneNumber;

	private String email;

}

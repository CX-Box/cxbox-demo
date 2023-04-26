package org.demo.entity;

import org.cxbox.model.core.entity.BaseEntity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "CONTACT")
@Getter
@Setter
@NoArgsConstructor
public class Contact extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "CLIENT_ID")
	private Client client;

	private String fullName;

	private String phoneNumber;

	private String email;

}

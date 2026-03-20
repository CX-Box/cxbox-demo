package org.demo.entity.core;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.cxbox.model.core.entity.BaseEntity;

@Entity
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@Table(name = "ADDITIONAL_FIELDS")
@Accessors(chain = true)
public class AdditionalFields extends BaseEntity {

	private String userId;

	@Column(name = "view_value")
	private String view;

	private String widget;

	private String orderFields;

	private String addedToAdditionalFields;

	private String removedFromAdditionalFields;

}
package org.demo.test;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class MyEntity1212 extends BaseEntity {

	@Column
	private String customField;

	@Column
	private String customFieldDrilldown;

	@Column
	private Long customFieldNumber=0L;

}
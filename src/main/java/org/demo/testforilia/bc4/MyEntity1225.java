package org.demo.testforilia.bc4;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.testforilia.bc1parent.MyEntity1223;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class MyEntity1225 extends BaseEntity {

	@Column
	private String customField;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_ID_1225")
	private MyEntity1223 customFieldEntity;

}
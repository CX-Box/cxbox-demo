package org.demo.testforilia.bc3;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.testforilia.bc1.MyEntity1222;
import org.demo.testforilia.bc1parent.MyEntity1223;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class MyEntity1224 extends BaseEntity {

	@Column
	private String customField;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_ID_1224")
	private MyEntity1222 customFieldEntity;

}
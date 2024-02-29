package org.demo.microservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;

@Entity
@Table(name = "t_lov_hierarchy")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class LovHierarchy extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "parent_lov_id")
	private ListOfValues parentLov;

	@ManyToOne
	@JoinColumn(name = "child_lov_id")
	private ListOfValues childLov;

}

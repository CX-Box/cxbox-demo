package org.demo.microservice.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.cxbox.model.core.entity.BaseEntity;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t_lov_hierarchy")
public class LovHierarchy extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "parent_lov_id")
	private ListOfValues parentLov;

	@ManyToOne
	@JoinColumn(name = "child_lov_id")
	private ListOfValues childLov;

}

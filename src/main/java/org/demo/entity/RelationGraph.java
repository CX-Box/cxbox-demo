package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "V_RELATION_GRAPH")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
@Immutable
public class RelationGraph  extends BaseEntity {

	@Column(name = "source_node_id")
	private String sourceNodeId;

	@Column(name = "target_node_id")
	private String targetNodeId;

	@Column(name = "target_node_expanded")
	private Boolean targetNodeExpanded;

	@Column(name = "target_node_name")
	private String targetNodeName;

	@Column(name = "edge_description")
	private String edgeDescription;

	@Column(name = "edge_value")
	private Long edgeValue;

	@Column(name = "target_client_id")
	private Long targetClientId;

	@Column(name = "root_client_id")
	private Long rootClientId;

}

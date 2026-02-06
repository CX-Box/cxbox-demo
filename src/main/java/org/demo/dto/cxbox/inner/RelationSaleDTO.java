package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.RelationGraph;

@Getter
@Setter
@NoArgsConstructor
public class RelationSaleDTO extends DataResponseDTO {

	private String sourceNodeId;

	private String targetNodeId;

	private Boolean targetNodeExpanded;

	private String targetNodeName;

	private String targetNodeType;

	private String edgeDescription;

	private Long edgeValue;

	private String colorEdge;


	public RelationSaleDTO(RelationGraph entity) {
		this.id = entity.getId().toString();
		this.sourceNodeId = entity.getSourceNodeId();
		this.targetNodeId = entity.getTargetNodeId();
		this.targetNodeExpanded = entity.getTargetNodeExpanded();
		this.targetNodeName = entity.getTargetNodeName();
		this.edgeDescription = entity.getEdgeDescription();
		this.edgeValue = entity.getEdgeValue();
		this.colorEdge = "#4C4C4C";
		if (entity.getEdgeValue() != null && entity.getEdgeValue() > 1000) {
			this.colorEdge = "#000000";
			if (entity.getEdgeValue() > 5000) {
				this.colorEdge = "#FF0000";
			}
		}
	}

}

package org.demo.dto.cxbox.anysource;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.RelationGraph;
import org.demo.entity.dictionary.ClientImportance;
import org.demo.entity.enums.TargetNodeType;

@Getter
@Setter
@NoArgsConstructor
public class RelationSaleDTO extends DataResponseDTO {

	private String sourceNodeId;

	private String targetNodeId;

	private Boolean targetNodeExpanded;

	private String targetNodeName;

	private TargetNodeType targetNodeType;

	private String targetNodeDescription;

	private String edgeDescription;

	private Long edgeValue;

	private String edgeColor;

	private String targetNodeColor;

	public RelationSaleDTO(RelationGraph entity) {
		this.id = entity.getId().toString();
		this.sourceNodeId = entity.getSourceNodeId();
		this.targetNodeId = entity.getTargetNodeId();
		this.targetNodeExpanded = entity.getTargetNodeExpanded();
		this.targetNodeName = entity.getTargetNodeName();
		this.targetNodeDescription = entity.getTargetNodeDescription();
		this.edgeValue = entity.getEdgeValue();
		this.edgeDescription = "Sum, $";
		this.targetNodeColor = ClientImportance.colors.get(entity.getTargetImportance());
	}

}

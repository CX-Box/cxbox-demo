package org.demo.dto.cxbox.anysource;

import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.Client;
import org.demo.entity.enums.TargetNodeType;
import org.demo.repository.projection.RelationGraphPrj;

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

	public RelationSaleDTO(RelationGraphPrj node, Client targetClient) {
		this.setId(node.targetId() + "_" + node.sourceId());
		this.setSourceNodeId(Optional.ofNullable(node.sourceId()).map(String::valueOf).orElse(null));
		if (node.sourceId() == null) {
			this.setId(node.targetId() + "_" + node.targetId());
		}
		this.setTargetNodeId(String.valueOf(node.targetId()));
		this.setTargetNodeExpanded(true);
		this.setTargetNodeDescription(String.valueOf(targetClient.getAddress()));
		this.setTargetNodeName(String.valueOf(targetClient.getFullName()));
		this.setTargetNodeType(null);
		this.setEdgeColor(null);
		this.setEdgeDescription("Sum, $");
		this.setEdgeValue(node.sum());
	}

}

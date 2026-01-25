package org.demo.dto.cxbox.inner;

import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.Client;
import org.demo.entity.RelationGraph;
import org.demo.entity.enums.TargetNodeType;
import org.demo.microservice.core.querylang.common.SearchParameter;

@Getter
@Setter
@NoArgsConstructor
public class RelationSaleDTO extends DataResponseDTO {


	private String  sourceNodeId;
	private String targetNodeId;
	private Boolean targetNodeExpanded;
	private String targetNodeName;
	private String targetNodeType;
	private String edgeDescription;
	private Long edgeValue;


	public RelationSaleDTO(RelationGraph entity) {
		this.id = entity.getId().toString();
		this.sourceNodeId = entity.getSourceNodeId();
		this.targetNodeId = entity.getTargetNodeId();
//		this.sourceNodeId = entity.getTargetNodeId();
//		this.targetNodeId = entity.getSourceNodeId();
		this.targetNodeExpanded = true;
		this.targetNodeName = entity.getTargetNodeName();
		this.targetNodeType = "main";
		this.edgeDescription = entity.getEdgeDescription();
		this.edgeValue = entity.getEdgeValue();
	}

}

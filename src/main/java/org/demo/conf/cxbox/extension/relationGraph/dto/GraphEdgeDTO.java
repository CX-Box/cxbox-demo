package org.demo.conf.cxbox.extension.relationGraph.dto;

import jakarta.annotation.Nullable;
import java.util.Optional;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.enums.TargetNodeType;

@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class GraphEdgeDTO extends DataResponseDTO {

	public static final String ID_SEPARATOR = "_";

	private Long edgeValue;

	private String edgeDescription;

	private String edgeColor;

	private String sourceNodeId;

	@NonNull
	private String targetNodeId;

	private TargetNodeType targetNodeType;

	private String targetNodeName;

	private String targetNodeDescription;

	private String targetNodeColor;

	private Boolean targetNodeExpanded;

	@NonNull
	public static String toId(@Nullable String sourceIdStr, @NonNull String targetIdStr) {
		return targetIdStr + ID_SEPARATOR + (sourceIdStr != null ? sourceIdStr : "");
	}

	@NonNull
	public static String idToTargetId(String id) {
		var ids = id.split(ID_SEPARATOR);
		return ids[0];
	}

	@Nullable
	public static String idToSourceId(String id) {
		var ids = id.split(ID_SEPARATOR);
		return ids.length == 2 ? ids[1] : null;
	}

	public abstract static class GraphEdgeDTOBuilder<C extends GraphEdgeDTO, B extends GraphEdgeDTOBuilder<C, B>> extends
			DataResponseDTOBuilder<C, B> {

		@NonNull
		public B from(@NonNull GraphEdgePrj node) {
			String sourceIdStr = Optional.ofNullable(node.sourceNodeId()).map(String::valueOf).orElse(null);
			String targetIdStr = String.valueOf(node.targetNodeId());
			this.id(toId(sourceIdStr, targetIdStr))
					.sourceNodeId(sourceIdStr)
					.targetNodeId(targetIdStr);
			return self();
		}

	}

}
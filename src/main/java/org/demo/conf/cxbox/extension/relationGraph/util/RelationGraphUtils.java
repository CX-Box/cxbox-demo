package org.demo.conf.cxbox.extension.relationGraph.util;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgeDTO;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgePrj;
import org.demo.entity.enums.TargetNodeType;

@Slf4j
@UtilityClass
public class RelationGraphUtils {

	public static void enrichWithRootEdges(List<GraphEdgePrj> edges) {
		var edgeIds = edges.stream()
				.flatMap(e -> Stream.of(e.sourceNodeId(), e.targetNodeId()))
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());

		var hasIncoming = edges.stream()
				.filter(e -> e.sourceNodeId() != null)
				.map(GraphEdgePrj::targetNodeId)
				.collect(Collectors.toSet());

		var rootEdgeIds = edgeIds.stream()
				.filter(id -> !hasIncoming.contains(id))
				.collect(Collectors.toSet());

		rootEdgeIds.forEach(id -> edges.add(new GraphEdgePrj(null, id, null)));
	}

	/**
	 * Ensures that fields targetNodeExpanded, targetNodeName, targetNodeType, targetNodeDescription, and targetNodeColor
	 * are consistent for all allEdges with the same targetNodeId. Null values are automatically filled with the first
	 * non-null value for each field in the group.
	 *
	 * @param allEdges List of graph allEdges
	 */
	//TODO>>delete and move to frontend
	@SuppressWarnings({"java:S3776"})
	public static void normalizeResult(List<GraphEdgeDTO> allEdges) {
		var targetNodeIdEdges = allEdges.stream()
				.collect(Collectors.groupingBy(GraphEdgeDTO::getTargetNodeId))
				.values();
		for (var edges : targetNodeIdEdges) {
			// Variables to hold the first non-null value for each field
			Boolean firstExpanded = null;
			String firstName = null;
			TargetNodeType firstType = null;
			String firstDescription = null;
			String firstColor = null;

			// Find first non-null value for each field
			for (var edge : edges) {
				if (firstExpanded == null) {
					firstExpanded = edge.getTargetNodeExpanded();
				}
				if (firstName == null) {
					firstName = edge.getTargetNodeName();
				}
				if (firstType == null) {
					firstType = edge.getTargetNodeType();
				}
				if (firstDescription == null) {
					firstDescription = edge.getTargetNodeDescription();
				}
				if (firstColor == null) {
					firstColor = edge.getTargetNodeColor();
				}
			}

			// Second pass: fill values with the first non-null value for each field
			for (var edge : edges) {
				edge.setTargetNodeExpanded(firstExpanded);
				edge.setTargetNodeName(firstName);
				edge.setTargetNodeType(firstType);
				edge.setTargetNodeDescription(firstDescription);
				edge.setTargetNodeColor(firstColor);
			}
		}
	}

}

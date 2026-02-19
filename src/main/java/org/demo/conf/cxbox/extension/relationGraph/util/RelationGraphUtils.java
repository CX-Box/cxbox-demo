package org.demo.conf.cxbox.extension.relationGraph.util;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgePrj;

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

}

package org.demo.util;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.experimental.UtilityClass;
import org.demo.repository.projection.RelationGraphPrj;

@UtilityClass
public class RelationGraphUtils {

	public static void enrichWithRootEdges(List<RelationGraphPrj> edges) {
		Set<Long> idsEdges =  edges.stream().<Long>mapMulti((e, out) -> {
					if (e.sourceId() != null) {
						out.accept(e.sourceId());
					}
					if (e.targetId() != null) {
						out.accept(e.targetId());
					}
				})
				.collect(Collectors.toSet());
		Set<Long> hasIncoming = edges.stream()
				.filter(e -> e.sourceId() != null)
				.map(RelationGraphPrj::targetId)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());
		var rootEdgeIds = idsEdges.stream()
				.filter(id -> !hasIncoming.contains(id))
				.toList();
		edges.addAll(
				rootEdgeIds.stream().map(id -> new RelationGraphPrj(null, id, -1L)).collect(Collectors.toSet())
		);
	}

}

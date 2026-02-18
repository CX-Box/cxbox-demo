package org.demo.repository.projection;


public record RelationGraphPrj(
		Long sourceId,
		Long targetId,
		Long sum
) {
}
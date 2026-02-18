package org.demo.conf.cxbox.extension.relationGraph.dto;

import lombok.NonNull;

public record GraphEdgePrj(Long sourceNodeId, @NonNull Long targetNodeId, Long value) {
}
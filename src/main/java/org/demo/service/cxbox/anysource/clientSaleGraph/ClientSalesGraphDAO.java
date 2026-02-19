package org.demo.service.cxbox.anysource.clientSaleGraph;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgeDTO;
import org.demo.entity.enums.TargetNodeType;
import org.demo.repository.ClientRepository;
import org.demo.repository.ClientSalesGraphRepository;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgePrj;
import org.demo.conf.cxbox.extension.relationGraph.util.RelationGraphUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSalesGraphDAO extends AbstractAnySourceBaseDAO<GraphEdgeDTO> implements
		AnySourceBaseDAO<GraphEdgeDTO> {

	private static final String COLOR_RED = "#DD0A34";

	private static final Long MAX_SUM = 1000L;

	private final ClientSalesGraphRepository clientSalesGraphRepository;

	private final ClientRepository clientRepository;

	@Override
	public String getId(GraphEdgeDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(String id, GraphEdgeDTO entity) {
		entity.setId(id);
	}

	@Override
	public GraphEdgeDTO getByIdIgnoringFirstLevelCache(BusinessComponent bc) {
		return getGraphEdgesList(bc).stream()
				.filter(dto -> dto.getId().equals(bc.getId()))
				.findFirst().orElse(null);
	}

	@Override
	public void delete(BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	public Page<GraphEdgeDTO> getList(BusinessComponent bc, QueryParameters queryParameters) {
		return new PageImpl<>(getGraphEdgesList(bc));
	}

	@Override
	public GraphEdgeDTO update(BusinessComponent bc, GraphEdgeDTO entity) {
		throw new UnsupportedOperationException();
	}

	@Override
	public GraphEdgeDTO create(BusinessComponent bc, GraphEdgeDTO entity) {
		throw new UnsupportedOperationException();
	}

	private List<GraphEdgeDTO> getGraphEdgesList(BusinessComponent bc) {
		var edges = clientSalesGraphRepository.findGraphEdges(bc.getParentIdAsLong());
		RelationGraphUtils.enrichWithRootEdges(edges);
		var nodes = clientRepository.findAllById(edges.stream().map(GraphEdgePrj::targetNodeId).toList())
				.stream()
				.collect(Collectors.toMap(BaseEntity::getId, c -> c));
		var result = new ArrayList<GraphEdgeDTO>();
		for (var edge : edges) {
			result.add(GraphEdgeDTO.builder()
					.from(edge)
					//edge params
					.edgeDescription("Sum, $")
					.edgeValue(edge.value())
					.edgeColor(Optional.ofNullable(edge.value()).map(value -> value > MAX_SUM ? COLOR_RED : null).orElse(null))
					//node params (must be same for all target nodes!)
					.targetNodeExpanded(true)
					.targetNodeName(nodes.get(edge.targetNodeId()).getFullName())
					.targetNodeType(Objects.equals(edge.targetNodeId(), bc.getParentIdAsLong()) ? TargetNodeType.MAIN : null)
					.targetNodeDescription(nodes.get(edge.targetNodeId()).getAddress())
					.targetNodeColor(Optional.ofNullable(edge.value()).map(value -> value > MAX_SUM ? COLOR_RED : null).orElse(null))
					.build()
			);
		}
		return result;
	}

}

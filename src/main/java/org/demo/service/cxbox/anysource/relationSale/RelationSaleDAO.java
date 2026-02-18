package org.demo.service.cxbox.anysource.relationSale;


import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.dto.cxbox.anysource.RelationSaleDTO;
import org.demo.entity.Client;
import org.demo.entity.enums.TargetNodeType;
import org.demo.repository.ClientRepository;
import org.demo.repository.RelationSaleRepository;
import org.demo.repository.projection.RelationGraphPrj;
import org.demo.util.RelationGraphUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RelationSaleDAO extends AbstractAnySourceBaseDAO<RelationSaleDTO> implements
		AnySourceBaseDAO<RelationSaleDTO> {

	private static final String COLOR_RED = "#DD0A34";

	private static final Long MAX_SUM = 1000L;

	private final RelationSaleRepository relationSaleRepository;

	private final ClientRepository clientRepository;

	@Override
	public String getId(RelationSaleDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(String id, RelationSaleDTO entity) {
		entity.setId(id);
	}

	@Override
	public RelationSaleDTO getByIdIgnoringFirstLevelCache(BusinessComponent bc) {
		// needly create new method to find id ( now  we have all infrormation to add UI right info)
		return findRelationsNodes(bc, null).stream()
				.filter(dto -> dto.getId().equals(bc.getId()))
				.findFirst().orElse(null);
	}


	@Override
	public void delete(BusinessComponent bc) {
		throw new UnsupportedOperationException("Not supported.");
	}

	@Override
	public Page<RelationSaleDTO> getList(BusinessComponent bc, QueryParameters queryParameters) {
		return new PageImpl<>(findRelationsNodes(bc, queryParameters));
	}

	@Override
	public RelationSaleDTO update(BusinessComponent bc, RelationSaleDTO entity) {
		throw new UnsupportedOperationException("Not supported.");
	}

	@Override
	public RelationSaleDTO create(BusinessComponent bc, RelationSaleDTO entity) {
		throw new UnsupportedOperationException("Not supported.");
	}

	private List<RelationSaleDTO> findRelationsNodes(BusinessComponent bc, QueryParameters queryParameters) {
		List<RelationGraphPrj> edges = relationSaleRepository.findAllRelatedClientForGraph(bc.getParentIdAsLong());
		RelationGraphUtils.enrichWithRootEdges(edges);
		return transformToDto(edges, bc);
	}

	private List<RelationSaleDTO> transformToDto(List<RelationGraphPrj> edges, BusinessComponent bc) {
		// Need to find information about node description (as like targetNodeDescription, targetNodeName)
		Map<Long, Client> clientsById = clientRepository.findAllById(edges.stream()
						.map(RelationGraphPrj::targetId)
						.toList()).stream()
				.collect(Collectors.toMap(BaseEntity::getId, c -> c));
		var dtos = edges.stream()
				.map(edge -> new RelationSaleDTO(edge, clientsById.get(edge.targetId())))
				.toList();
		enrichDtoAdditionalData(dtos, bc);
		return dtos;
	}

	private void enrichDtoAdditionalData(List<RelationSaleDTO> dtos, BusinessComponent bc) {
		dtos.forEach(d -> {
			if (d.getTargetNodeId().equals(bc.getParentId())) {
				d.setTargetNodeType(TargetNodeType.MAIN);
			}
		});
		var targetNodeWithHighlight = dtos.stream()
				.filter(d -> d.getEdgeValue() > MAX_SUM)
				.peek(d->d.setEdgeColor(COLOR_RED))
				.map(RelationSaleDTO::getTargetNodeId)
				.collect(Collectors.toSet());
		dtos.stream().filter(dto->targetNodeWithHighlight.contains(dto.getTargetNodeId()))
				.forEach(dto->dto.setTargetNodeColor(COLOR_RED));
	}

}

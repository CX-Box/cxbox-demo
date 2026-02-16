package org.demo.service.cxbox.anysource.relationSale;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.RelationSaleDTO;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RelationSaleDAO  extends AbstractAnySourceBaseDAO<RelationSaleDTO> implements
		AnySourceBaseDAO<RelationSaleDTO> {

	private final RelationGraphJdbcDao dao;

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
		return getAllGraph(bc).stream()
				.filter(d -> d.getId().equals(bc.getId()))
				.findFirst()
				.orElse(null);
	}

	private @NonNull List<RelationSaleDTO> getAllGraph(BusinessComponent bc) {
		return dao.loadGraph(bc.getParentIdAsLong()).stream().map(r -> {
			RelationSaleDTO dto = new RelationSaleDTO();
			dto.setId(r.id());
			dto.setSourceNodeId(r.sourceNodeId());
			dto.setTargetNodeId(r.targetNodeId());
			dto.setTargetNodeName(r.targetNodeName());
			dto.setTargetNodeType(r.targetNodeType());
			dto.setTargetNodeDescription(r.targetNodeDescription());
			dto.setTargetNodeExpanded(r.targetNodeExpanded());
			dto.setEdgeDescription("Sum, $");
			dto.setEdgeValue(r.edgeValue());
			dto.setEdgeColor(r.color());
			dto.setTargetNodeColor(r.color());
			return dto;

		}).toList();
	}

	@Override
	public void delete(BusinessComponent bc) {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	@Override
	public Page<RelationSaleDTO> getList(BusinessComponent bc, QueryParameters queryParameters) {
		return new PageImpl<>(getAllGraph(bc));
	}

	@Override
	public RelationSaleDTO update(BusinessComponent bc, RelationSaleDTO entity) {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	@Override
	public RelationSaleDTO create(BusinessComponent bc, RelationSaleDTO entity) {
		throw new UnsupportedOperationException("Not supported yet.");
	}


}

package org.demo.service.cxbox.anysource.clientSaleGraph;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgeDTO;
import org.springframework.stereotype.Service;

@Getter
@Service
@RequiredArgsConstructor
public class ClientSalesGraphService extends AnySourceVersionAwareResponseService<GraphEdgeDTO, GraphEdgeDTO> {


	@Getter(onMethod_ = @Override)
	private final Class<ClientSalesGraphMetaBuilder> meta = ClientSalesGraphMetaBuilder.class;

	@Getter(onMethod_ = @Override)
	private final Class<ClientSalesGraphDAO> dao = ClientSalesGraphDAO.class;


	@Override
	protected CreateResult<GraphEdgeDTO> doCreateEntity(GraphEdgeDTO entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<GraphEdgeDTO> doUpdateEntity(GraphEdgeDTO entity, GraphEdgeDTO data, BusinessComponent bc) {
		return null;
	}

}


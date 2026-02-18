package org.demo.service.cxbox.anysource.relationSale;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgeDTO;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgeDTO_;
import org.springframework.stereotype.Service;

@Service
public class ClientSalesGraphMetaBuilder extends AnySourceFieldMetaBuilder<GraphEdgeDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<GraphEdgeDTO> fields, BcDescription bcDescription, String id,
			String parentId) {
		fields.setDisabled(GraphEdgeDTO_.id);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<GraphEdgeDTO> fields, BcDescription bcDescription, String parentId) {
		fields.setDisabled(GraphEdgeDTO_.id);
	}

}

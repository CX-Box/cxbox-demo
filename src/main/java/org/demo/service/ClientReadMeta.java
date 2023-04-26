package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.dto.ClientReadDTO;
import org.demo.dto.ClientReadDTO_;
import org.demo.dto.ClientWriteDTO_;
import org.demo.entity.enums.ClientImportance;
import org.demo.entity.enums.ClientStatus;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class ClientReadMeta extends FieldMetaBuilder<ClientReadDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientReadDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setDrilldown(
				ClientReadDTO_.fullName,
				DrillDownType.INNER,
				"/screen/client/view/clientview/" + CxboxRestController.client + "/" + id
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientReadDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(ClientReadDTO_.fullName);
		fields.enableFilter(ClientReadDTO_.address);
		fields.enableFilter(ClientWriteDTO_.importance);
		fields.setEnumFilterValues(fields, ClientWriteDTO_.importance, ClientImportance.values());
		fields.enableFilter(ClientWriteDTO_.status);
		fields.setEnumFilterValues(fields, ClientWriteDTO_.status, ClientStatus.values());
	}

}

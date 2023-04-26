package org.demo.service;

import org.demo.dto.ClientReadDTO;
import org.demo.dto.ClientReadDTO_;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class ClientPickListMeta extends FieldMetaBuilder<ClientReadDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientReadDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ClientReadDTO_.id,
				ClientReadDTO_.fullName
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientReadDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {

	}

}

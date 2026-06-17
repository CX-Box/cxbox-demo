package org.demo.service.cxbox.anysource.clientstatsline;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.ClientSaleLineDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientSaleLineStatsMeta extends AnySourceFieldMetaBuilder<ClientSaleLineDTO> {

	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientSaleLineDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientSaleLineDTO> fields, BcDescription bcDescription,
			String parentId) {
		// do nothing
	}

}

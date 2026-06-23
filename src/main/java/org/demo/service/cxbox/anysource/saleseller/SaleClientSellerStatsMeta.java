package org.demo.service.cxbox.anysource.saleseller;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.inner.SaleSellerStatsDTO;
import org.demo.entity.enums.ClientStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleClientSellerStatsMeta extends AnySourceFieldMetaBuilder<SaleSellerStatsDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleSellerStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

	}

	private ClientStatus getStatusFilterValues(@NonNull String id) {
		return ClientStatus.getById(id);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleSellerStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

}

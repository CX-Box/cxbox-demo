package org.demo.service.cxbox.anysource.saleprogress;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.SalesProgressStatsDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleProgressStatsMeta extends AnySourceFieldMetaBuilder<SalesProgressStatsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SalesProgressStatsDTO> fields, BcDescription bc,
			String id, String parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SalesProgressStatsDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}

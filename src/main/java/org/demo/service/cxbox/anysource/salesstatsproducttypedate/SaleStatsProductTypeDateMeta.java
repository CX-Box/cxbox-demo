package org.demo.service.cxbox.anysource.salesstatsproducttypedate;


import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.DashboardSalesProductTypeDateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductTypeDateMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductTypeDateDTO> {


	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductTypeDateDTO> fields, BcDescription bc,
			String id, String parentId) {

	}


	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductTypeDateDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}

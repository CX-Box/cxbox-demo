package org.demo.service.cxbox.anysource.sale;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.springframework.stereotype.Service;

@Service
public class SaleClientMetaBuilder extends AnySourceFieldMetaBuilder<SaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, BcDescription bc,
			String id,
			String parentId) {

			fields.setDrilldownWithFilter(
					SaleDTO_.clientName,
					DrillDownType.INNER,
					"/screen/client/view/clientlist",
					fc -> fc.add(
							CxboxRestController.client, ClientReadDTO.class,
							fb -> {
								fb.input(ClientReadDTO_.fullName, fields.getCurrentValue(SaleDTO_.clientName).orElse(null));
							}
					)
			);
			fields.setDrilldownWithFilter(
					SaleDTO_.clientSellerName,
					DrillDownType.INNER,
					"/screen/client/view/clientlist",
					fc -> fc.add(
							CxboxRestController.client, ClientReadDTO.class,
							fb -> {
								fb.input(ClientReadDTO_.fullName, fields.getCurrentValue(SaleDTO_.clientSellerName).orElse(null));
							}
					)
			);

		fields.setRequired(SaleDTO_.status);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, BcDescription bcDescription, String parentId) {
		//do nothing
	}

}

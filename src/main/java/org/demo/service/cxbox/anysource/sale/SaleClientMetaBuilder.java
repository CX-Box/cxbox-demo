package org.demo.service.cxbox.anysource.sale;

import java.util.Optional;
import lombok.AllArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.Sale;
import org.demo.repository.SaleRepository;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SaleClientMetaBuilder extends AnySourceFieldMetaBuilder<SaleDTO> {

	private final SaleRepository saleRepository;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, BcDescription bc,
			String id,
			String parentId) {
		Optional<Sale> sale = saleRepository.findById(Long.valueOf(id));
		sale.ifPresent(value -> {
					fields.setDrilldown(
							SaleDTO_.clientName,
							DrillDownType.INNER,
							"/screen/client/view/clientview/" + CxboxRestController.clientEdit + "/"
									+ sale.get().getClient().getId()
					);

					fields.setDrilldown(
							SaleDTO_.clientSellerName,
							DrillDownType.INNER,
							"/screen/client/view/clientview/" + CxboxRestController.clientEdit + "/"
									+ sale.get().getClientSeller().getId());
				}
		);
		fields.setRequired(SaleDTO_.status);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, BcDescription bcDescription, String parentId) {
		//do nothing
	}

}

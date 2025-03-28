package org.demo.service.cxbox.inner;


import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.enums.SaleStatus;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class SaleWriteMeta extends FieldMetaBuilder<SaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {

		fields.setEnabled(
				SaleDTO_.clientName,
				SaleDTO_.clientId,
				SaleDTO_.product,
				SaleDTO_.status,
				SaleDTO_.sum
		);

		fields.setRequired(
				SaleDTO_.clientName,
				SaleDTO_.clientId,
				SaleDTO_.product,
				SaleDTO_.status,
				SaleDTO_.sum
		);
		fields.setDictionaryValues(SaleDTO_.product);
		fields.setEnumValues(SaleDTO_.status, SaleStatus.values());

		fields.setDrilldown(
				SaleDTO_.clientName,
				DrillDownType.INNER,
				"/screen/sale"
						+ "/" + CxboxRestController.sale
						+ "?filters={\""
						+ CxboxRestController.sale
						+ "\":\""
						+ SaleDTO_.id.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName()
						+ "=[\\\""
						+ id
						+ "\\\"]"
						+ "\"}"
		);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription, Long parentId) {
	}

}

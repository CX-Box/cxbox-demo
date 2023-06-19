package org.demo.service;

import org.demo.controller.CxboxRestController;
import org.demo.dto.ProductDTO;
import org.demo.dto.ProductDTO_;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.entity.enums.MacroProduct;
import org.demo.entity.enums.StatusEnum;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ProductReadMeta extends FieldMetaBuilder<ProductDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ProductDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(ProductDTO_.gBCCheckedFlg);
		fields.setEnabled(ProductDTO_.notDSA);
		fields.setEnabled(ProductDTO_.nonStandartFlag);
		fields.setEnabled(ProductDTO_.version);
		fields.setEnabled(ProductDTO_.endDate);
		fields.setEnabled(ProductDTO_.startDate);
		fields.setEnumValues(ProductDTO_.status, StatusEnum.values());
		fields.setEnabled(ProductDTO_.status);
		fields.setEnumValues(ProductDTO_.macroProduct, MacroProduct.values());
		fields.setEnabled(ProductDTO_.macroProduct);
		fields.setDrilldown(
				ProductDTO_.productCode,
				DrillDownType.INNER,
				"/screen/product/view/productSelectionMatrixView/" + CxboxRestController.productEdit + "/" + id
		);
		fields.setEnabled(ProductDTO_.productCode);
		fields.setEnabled(ProductDTO_.siebelId);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ProductDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(ProductDTO_.gBCCheckedFlg);
		fields.enableFilter(ProductDTO_.notDSA);
		fields.enableFilter(ProductDTO_.nonStandartFlag);
		fields.enableFilter(ProductDTO_.version);
		fields.enableFilter(ProductDTO_.endDate);
		fields.enableFilter(ProductDTO_.startDate);
		fields.setEnumFilterValues(fields, ProductDTO_.status, StatusEnum.values());
		fields.enableFilter(ProductDTO_.status);
		fields.setEnumFilterValues(fields, ProductDTO_.macroProduct, MacroProduct.values());
		fields.enableFilter(ProductDTO_.macroProduct);
		fields.enableFilter(ProductDTO_.productCode);
		fields.enableFilter(ProductDTO_.siebelId);

	}

}

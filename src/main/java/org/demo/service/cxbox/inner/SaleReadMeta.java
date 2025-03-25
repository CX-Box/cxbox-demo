package org.demo.service.cxbox.inner;

import java.util.Arrays;
import java.util.stream.Collectors;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class SaleReadMeta extends FieldMetaBuilder<SaleDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setDictionaryValues(SaleDTO_.product);
		fields.setEnumValues(SaleDTO_.status);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(SaleDTO_.createdDate);
		fields.enableSort(
				SaleDTO_.createdDate,
				SaleDTO_.clientName,
				SaleDTO_.product,
				SaleDTO_.status,
				SaleDTO_.sum
		);
		fields.enableFilter(SaleDTO_.status);
		fields.setEnumFilterValues(fields,SaleDTO_.status, SaleStatus.values());
		fields.enableFilter(SaleDTO_.clientName);
		fields.enableFilter(SaleDTO_.product);
		fields.setDictionaryFilterValues(SaleDTO_.product);
		fields.enableFilter(SaleDTO_.fieldOfActivity);
		fields.setConcreteFilterValues(SaleDTO_.fieldOfActivity, Arrays
				.stream(FieldOfActivity.values())
				.map(en -> new SimpleDictionary(en.name(), en.getValue()))
				.collect(Collectors.toList())
		);
	}

}

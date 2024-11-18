package org.demo.service.cxbox.inner.core;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.DictionaryTypeDTO;
import org.demo.dto.cxbox.inner.DictionaryTypeDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S6813"})
@Service
public class DictionaryTypeMeta extends FieldMetaBuilder<DictionaryTypeDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DictionaryTypeDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(DictionaryTypeDTO_.type);
		fields.setRequired(DictionaryTypeDTO_.type);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DictionaryTypeDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(DictionaryTypeDTO_.type);
		fields.enableSort(DictionaryTypeDTO_.type);
	}

}

package org.demo.conf.cxbox.customization.dictionary.service;

import static org.demo.conf.cxbox.customization.dictionary.dto.DictionaryTypeAdminDTO_.*;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.conf.cxbox.customization.dictionary.dto.DictionaryTypeAdminDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S6813"})
@Service
public class DictionaryTypeAdminMeta extends FieldMetaBuilder<DictionaryTypeAdminDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DictionaryTypeAdminDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(type);
		fields.setRequired(type);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DictionaryTypeAdminDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(type);
		fields.enableSort(type);
	}

}

package org.demo.service;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.AppUserMultivalueDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings("EmptyMethod")
@Service
public class AppUserMultivalueMeta extends FieldMetaBuilder<org.demo.dto.AppUserMultivalueDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<org.demo.dto.AppUserMultivalueDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(AppUserMultivalueDTO_.email);
		fields.setEnabled(org.demo.dto.AppUserMultivalueDTO_.id);
		fields.setEnabled(org.demo.dto.AppUserMultivalueDTO_.fullUserName);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<org.demo.dto.AppUserMultivalueDTO> fields,
			InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(AppUserMultivalueDTO_.fullUserName);
		fields.enableFilter(AppUserMultivalueDTO_.email);

	}

}

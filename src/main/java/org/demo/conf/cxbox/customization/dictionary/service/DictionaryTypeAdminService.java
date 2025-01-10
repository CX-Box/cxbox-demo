package org.demo.conf.cxbox.customization.dictionary.service;

import static org.demo.conf.cxbox.customization.dictionary.dto.DictionaryTypeAdminDTO_.*;

import lombok.Getter;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.core.dao.JpaDao;
import org.cxbox.model.dictionary.entity.DictionaryTypeDesc;
import org.demo.conf.cxbox.customization.dictionary.dto.DictionaryTypeAdminDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;

@Getter
@Service
@SuppressWarnings({"java:S6813"})
public class DictionaryTypeAdminService extends VersionAwareResponseService<DictionaryTypeAdminDTO, DictionaryTypeDesc> {

	@Autowired
	private JpaDao jpaDao;

	public DictionaryTypeAdminService() {
		super(DictionaryTypeAdminDTO.class, DictionaryTypeDesc.class, null, DictionaryTypeAdminMeta.class);
	}

	@Override
	protected CreateResult<DictionaryTypeAdminDTO> doCreateEntity(DictionaryTypeDesc entity, BusinessComponent bc) {
		jpaDao.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<DictionaryTypeAdminDTO> doUpdateEntity(DictionaryTypeDesc entity, DictionaryTypeAdminDTO data,
			BusinessComponent bc) {
		setIfChanged(data, type, entity::setType);
		jpaDao.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<DictionaryTypeAdminDTO> getActions() {
		return Actions.<DictionaryTypeAdminDTO>builder()
				.create(crt -> crt.text("Create"))
				.cancelCreate(ccr -> ccr.text("Cancel"))
				.save(sv -> sv.text("Save"))
				.delete(dlt -> dlt.text("Delete"))
				.build();
	}

}
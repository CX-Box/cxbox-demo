package org.demo.service.cxbox.inner;

import lombok.Getter;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.dictionary.entity.DictionaryTypeDesc;
import org.demo.dto.cxbox.inner.DictionaryTypeDTO;
import org.demo.dto.cxbox.inner.DictionaryTypeDTO_;
import org.demo.repository.DictionaryTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;

@Getter
@Service
@SuppressWarnings({"java:S6813"})
public class DictionaryTypeService extends VersionAwareResponseService<DictionaryTypeDTO, DictionaryTypeDesc> {

	@Autowired
	private DictionaryTypeRepository dictionaryTypeRepository;

	public DictionaryTypeService() {
		super(DictionaryTypeDTO.class, DictionaryTypeDesc.class, null, DictionaryTypeMeta.class);
	}

	@Override
	protected CreateResult<DictionaryTypeDTO> doCreateEntity(DictionaryTypeDesc entity, BusinessComponent bc) {
		dictionaryTypeRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<DictionaryTypeDTO> doUpdateEntity(DictionaryTypeDesc entity, DictionaryTypeDTO data,
			BusinessComponent bc) {
		setIfChanged(data, DictionaryTypeDTO_.type, entity::setType);
		dictionaryTypeRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<DictionaryTypeDTO> getActions() {
		return Actions.<DictionaryTypeDTO>builder()
				.create(crt -> crt.text("Create"))
				.cancelCreate(ccr -> ccr.text("Cancel"))
				.save(sv -> sv.text("Save"))
				.delete(dlt -> dlt.text("Delete"))
				.build();
	}

}
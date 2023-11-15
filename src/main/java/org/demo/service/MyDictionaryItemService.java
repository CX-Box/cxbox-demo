package org.demo.service;

import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.model.dictionary.entity.DictionaryItem;
import org.cxbox.source.dto.DictionaryItemDTO;
import org.cxbox.source.services.data.impl.DictionaryItemsServiceImpl;
import org.demo.repository.DictionaryItemRepository;
import org.demo.repository.DictionaryTypeDescRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MyDictionaryItemService extends DictionaryItemsServiceImpl {

	private final DictionaryItemRepository dictionaryItemRepository;
	private final DictionaryTypeDescRepository dictionaryTypeDescRepository;

	@Override
	protected CreateResult<DictionaryItemDTO> doCreateEntity(DictionaryItem entity, BusinessComponent bc) {
		entity.setId(new Random().nextLong());
		entity.setAdditionFlg(true);
		entity.setDictionaryTypeId(dictionaryTypeDescRepository.getById(1L));
		return new CreateResult(entityToDto(bc, dictionaryItemRepository.save(entity)));
	}

}

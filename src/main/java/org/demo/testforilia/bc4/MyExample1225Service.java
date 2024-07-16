package org.demo.testforilia.bc4;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@Service
public class MyExample1225Service extends VersionAwareResponseService<MyExample1225DTO, MyEntity1225> {

	private final MyEntity1225Repository repository;

	public MyExample1225Service(MyEntity1225Repository repository) {
		super(MyExample1225DTO.class, MyEntity1225.class, null, MyExample1225Meta.class);
		this.repository = repository;
	}

	@Override
	protected CreateResult<MyExample1225DTO> doCreateEntity(MyEntity1225 entity, BusinessComponent bc) {
		repository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MyExample1225DTO> doUpdateEntity(MyEntity1225 entity, MyExample1225DTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(MyExample1225DTO_.customField)) {
			entity.setCustomField(data.getCustomField());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MyExample1225DTO> getActions() {
		return Actions.<MyExample1225DTO>builder()
				.newAction()
				.action("save", "save")
				.add()
				.create()
				.add()
				.delete()
				.add()
				.build();
	}


}


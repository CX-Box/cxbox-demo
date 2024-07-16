package org.demo.testforilia.bc1;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@Service
public class MyExample1222Service extends VersionAwareResponseService<MyExample1222DTO, MyEntity1222> {

	private final MyEntity1222Repository repository;

	public MyExample1222Service(MyEntity1222Repository repository) {
		super(MyExample1222DTO.class, MyEntity1222.class, null, MyExample1222Meta.class);
		this.repository = repository;
	}

	@Override
	protected CreateResult<MyExample1222DTO> doCreateEntity(MyEntity1222 entity, BusinessComponent bc) {
		repository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MyExample1222DTO> doUpdateEntity(MyEntity1222 entity, MyExample1222DTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(MyExample1222DTO_.customField)) {
			entity.setCustomField(data.getCustomField());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MyExample1222DTO> getActions() {
		return Actions.<MyExample1222DTO>builder()
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


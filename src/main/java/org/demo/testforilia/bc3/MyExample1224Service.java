package org.demo.testforilia.bc3;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@Service
public class MyExample1224Service extends VersionAwareResponseService<MyExample1224DTO, MyEntity1224> {

	private final MyEntity1224Repository repository;

	public MyExample1224Service(MyEntity1224Repository repository) {
		super(MyExample1224DTO.class, MyEntity1224.class, null, MyExample1224Meta.class);
		this.repository = repository;
	}

	@Override
	protected CreateResult<MyExample1224DTO> doCreateEntity(MyEntity1224 entity, BusinessComponent bc) {
		repository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MyExample1224DTO> doUpdateEntity(MyEntity1224 entity, MyExample1224DTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(MyExample1224DTO_.customField)) {
			entity.setCustomField(data.getCustomField());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MyExample1224DTO> getActions() {
		return Actions.<MyExample1224DTO>builder()
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


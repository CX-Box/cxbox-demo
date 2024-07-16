package org.demo.testforilia.bc1parent;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@Service
public class MyExample1223Service extends VersionAwareResponseService<MyExample1223DTO, MyEntity1223> {

	private final MyEntity1223Repository repository;

	public MyExample1223Service(MyEntity1223Repository repository) {
		super(MyExample1223DTO.class, MyEntity1223.class, null, MyExample1223Meta.class);
		this.repository = repository;
	}

	@Override
	protected CreateResult<MyExample1223DTO> doCreateEntity(MyEntity1223 entity, BusinessComponent bc) {
		repository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MyExample1223DTO> doUpdateEntity(MyEntity1223 entity, MyExample1223DTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(MyExample1223DTO_.customField)) {
			entity.setCustomField(data.getCustomField());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MyExample1223DTO> getActions() {
		return Actions.<MyExample1223DTO>builder()
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


package org.demo.test;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.Actions;
import org.springframework.stereotype.Service;

@Service
public class MyExample1212Service extends VersionAwareResponseService<MyExample1212DTO, MyEntity1212> {

	private final MyEntity1212Repository repository;

	public MyExample1212Service(MyEntity1212Repository repository) {
		super(MyExample1212DTO.class, MyEntity1212.class, null, MyExample1212Meta.class);
		this.repository = repository;
	}

	@Override
	protected CreateResult<MyExample1212DTO> doCreateEntity(MyEntity1212 entity, BusinessComponent bc) {
		repository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MyExample1212DTO> doUpdateEntity(MyEntity1212 entity, MyExample1212DTO data,
			BusinessComponent bc) {
		setIfChanged(data, MyExample1212DTO_.customFieldNumber, entity::setCustomFieldNumber);
		setIfChanged(data, org.demo.test.MyExample1212DTO_.customFieldDrilldown, entity::setCustomFieldDrilldown);
		if (data.isFieldChanged(MyExample1212DTO_.customField)) {
			entity.setCustomField(data.getCustomField());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MyExample1212DTO> getActions() {
		return Actions.<MyExample1212DTO>builder()
				.create(crt -> crt.text("Add"))
				.save(sv -> sv.text("Save"))
				.cancelCreate(ccr -> ccr.text("Cancel").available(bc -> true))
				.delete(dlt -> dlt.text("Delete"))
				.action(act -> act
						.action("finish", "Save and Close")
						.invoker((bc, data) -> {
									MyEntity1212 myEntity = repository.getById(bc.getIdAsLong());
									repository.save(myEntity);
									return new ActionResultDTO<MyExample1212DTO>().setAction(
											PostAction.drillDown(
													DrillDownType.INNER,
													"/screen/myexample1212/view/myexample1212list"
											));
								}
						))
				.build();
	}


}


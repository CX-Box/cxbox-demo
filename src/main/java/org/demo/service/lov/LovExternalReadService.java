package org.demo.service.lov;

import static org.demo.controller.CxboxRestController.lovExternal;
import static org.demo.dto.LovDTO_.additionalParameter1;
import static org.demo.dto.LovDTO_.additionalParameter2;
import static org.demo.dto.LovDTO_.code;
import static org.demo.dto.LovDTO_.descriptionText;
import static org.demo.dto.LovDTO_.externalCode;
import static org.demo.dto.LovDTO_.inactiveFlag;
import static org.demo.dto.LovDTO_.orderBy;
import static org.demo.dto.LovDTO_.typeName;
import static org.demo.dto.LovDTO_.value;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.ExternalVersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.LovDTO;
import org.demo.microservice.dto.DictDTO;
import org.springframework.stereotype.Service;

@Service
public class LovExternalReadService extends ExternalVersionAwareResponseService<LovDTO, DictDTO> {

	public LovExternalReadService() {
		super(LovDTO.class, DictDTO.class, LovExternalReadMeta.class, LovExternalBaseDAO.class);
	}

	@Override
	protected CreateResult<LovDTO> doCreateEntity(DictDTO entity, BusinessComponent bc) {
		return new CreateResult<>(entityToDto(bc, entity)).setAction(PostAction.drillDown(
				DrillDownType.INNER,
				"/screen/admin/view/lovCreateExternal/" + lovExternal + "/" + entity.getId()
		));
	}

	@Override
	protected ActionResultDTO<LovDTO> doUpdateEntity(DictDTO entity, LovDTO data, BusinessComponent bc) {
		setIfChanged(data, value, entity::setValue);
		setIfChanged(data, descriptionText, entity::setDescriptionText);
		setIfChanged(data, typeName, entity::setTypeName);
		setIfChanged(data, code, entity::setCode);
		setIfChanged(data, orderBy, entity::setOrderBy);
		setMappedIfChanged(data, inactiveFlag, entity::setInactiveFlag, Object::toString);
		setIfChanged(data, externalCode, entity::setExternalCode);
		setIfChanged(data, additionalParameter1, entity::setAdditionalParameter1);
		setIfChanged(data, additionalParameter2, entity::setAdditionalParameter2);

		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<LovDTO> getActions() {
		return Actions.<LovDTO>builder()
				.create().text("Создать").available(bc -> true).add()
				.action("change", "Редактировать")
				.available(bc -> true)
				.scope(ActionScope.RECORD)
				.invoker(((bc, data) -> new ActionResultDTO<LovDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/admin/view/lovUpdateExternal/" + lovExternal + "/" + bc.getId()
						)
				))).add()
				.action("deleteLov", "Удалить")
				.withPreAction(PreAction.confirm(
						"Убедитесь что запись деактивирована. \n\nВы точно хотите удалить данную запись справочника?"))
				.scope(ActionScope.RECORD)
				.invoker((bc, data) -> {
					getBaseDao().delete(bc);
					return new ActionResultDTO<LovDTO>().setAction(
							PostAction.drillDown(
									DrillDownType.INNER,
									"/screen/admin/view/lovlistexternal"
							)
					);
				}).add()
				.action("saveAndBack", "Сохранить")
				.available(bc -> true)
				.invoker(this::save)
				.add()
				.save().text("Сохранить")
				.available(bc -> true)
				.add()
				.build();
	}

	//TODO>>если кастом экшн завершает создание сохранением в микросервисе который меняет id с временного на постоянный,
	// то обязательно сообщить фронту новый id вернув new ActionResultDTO<>(entityToDto(bc, dto)).
	// в остальных случаях достаточно new ActionResultDTO<>()
	// т.е. простое правило есть getBaseDao().flush(bc); => есть сохранение в микросервис -> надо new ActionResultDTO<>(entityToDto(bc, dto)).
	// Иначе достаточно new ActionResultDTO<>()
	private ActionResultDTO<LovDTO> save(BusinessComponent bc, LovDTO data) {
		getBaseDao().flush(bc);
		DictDTO dto = getBaseDao().getById(bc);
		return new ActionResultDTO<>(entityToDto(bc, dto));
	}

}

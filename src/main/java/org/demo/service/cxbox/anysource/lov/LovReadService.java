package org.demo.service.cxbox.anysource.lov;


import static org.demo.controller.CxboxRestController.lovExternal;
import static org.demo.dto.cxbox.anysource.LovDTO_.additionalParameter1;
import static org.demo.dto.cxbox.anysource.LovDTO_.additionalParameter2;
import static org.demo.dto.cxbox.anysource.LovDTO_.code;
import static org.demo.dto.cxbox.anysource.LovDTO_.descriptionText;
import static org.demo.dto.cxbox.anysource.LovDTO_.externalCode;
import static org.demo.dto.cxbox.anysource.LovDTO_.inactiveFlag;
import static org.demo.dto.cxbox.anysource.LovDTO_.orderBy;
import static org.demo.dto.cxbox.anysource.LovDTO_.typeName;
import static org.demo.dto.cxbox.anysource.LovDTO_.value;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AnySourceVersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.demo.conf.cxbox.extension.action.ActionsExt;
import org.demo.dto.cxbox.anysource.LovDTO;
import org.demo.microservice.dto.DictDTO;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S1170", "java:S2387"})
@RequiredArgsConstructor
@Getter
@Service
public class LovReadService extends AnySourceVersionAwareResponseService<LovDTO, DictDTO> {

	private final Class<LovReadMeta> fieldMetaBuilder = LovReadMeta.class;

	private final Class<LovDao> anySourceBaseDAOClass = LovDao.class;

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
		setIfChanged(data, inactiveFlag, entity::setInactiveFlag);
		setIfChanged(data, externalCode, entity::setExternalCode);
		setIfChanged(data, additionalParameter1, entity::setAdditionalParameter1);
		setIfChanged(data, additionalParameter2, entity::setAdditionalParameter2);

		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<LovDTO> getActions() {
		return Actions.<LovDTO>builder()
				.create(crt -> crt.text("Create").available(bc -> true))
				.action(act -> act
						.action("change", "Edit")
						.available(bc -> true)
						.scope(ActionScope.RECORD)
						.invoker(((bc, data) -> new ActionResultDTO<LovDTO>().setAction(
								PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/admin/view/lovUpdateExternal/" + lovExternal + "/" + bc.getId()
								)
						))))
				.action(act -> act
						.action("deleteLov", "Delete")
						.withPreAction(ActionsExt.confirm(
								"Make sure the entry is deactivated. \\n\\nAre you sure you want to delete this directory entry?",
								"Ops!",
								"yes",
								"no"
						))
						.scope(ActionScope.RECORD)
						.invoker((bc, data) -> {
							getBaseDao().delete(bc);
							return new ActionResultDTO<LovDTO>().setAction(
									PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/admin/view/lovlistexternal"
									)
							);
						}))
				.action(act -> act
						.action("saveAndBack", "Save and back")
						.available(bc -> true)
						.invoker((bc, data1) -> {
							ActionResultDTO<LovDTO> result = save(bc, data1);
							return result.setAction(PostAction.drillDown(DrillDownType.INNER, "/screen/admin"));
						})
				)
				.save(sv -> sv.text("Save")
						.available(bc -> true)
				)
				.build();
	}

	//TODO>>if a custom action completes its creation by saving it in a microservice that changes the id from temporary to permanent,
// then be sure to inform the front of the new id by returning new ActionResultDTO<>(entityToDto(bc, dto)).
// in other cases new ActionResultDTO<>() is enough
// i.e. a simple rule is getBaseDao().flush(bc); => there is saving to a microservice -> you need new ActionResultDTO<>(entityToDto(bc, dto)).
// Otherwise, new ActionResultDTO<>() is enough
	private ActionResultDTO<LovDTO> save(BusinessComponent bc, LovDTO data) {
		getBaseDao().flush(bc);
		DictDTO dto = getBaseDao().getById(bc);
		return new ActionResultDTO<>(entityToDto(bc, dto));
	}

}

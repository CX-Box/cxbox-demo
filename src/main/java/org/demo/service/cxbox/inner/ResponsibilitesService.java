package org.demo.service.cxbox.inner;

import static java.util.Optional.ofNullable;
import static org.demo.entity.core.User.DEFAULT_DEPARTMENT_ID;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.stream.Collectors;
import org.cxbox.core.controller.param.FilterParameter;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;

import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;

import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.meta.entity.Responsibilities;

import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.cxbox.meta.entity.Responsibilities_;
import org.demo.conf.cxbox.extension.resposibilities.ResponsibilitiesServiceExt;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO;


import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO_;

import org.demo.entity.dictionary.InternalRole;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S6813"})
@Service
public class ResponsibilitesService extends VersionAwareResponseService<ResponsibilitesCrudDTO, Responsibilities> {

	@Autowired
	private ResponsibilitiesServiceExt responsibilitiesServiceExt;

	public ResponsibilitesService() {
		super(ResponsibilitesCrudDTO.class, Responsibilities.class, null, ResponsibilitesMeta.class);
	}

	@Override
	public Specification<Responsibilities> getSpecification(BusinessComponent bc) {
		List<String> viewWidgetsFilterValues = getFilterFieldName(
				bc.getParameters(),
				ResponsibilitesCrudDTO_.viewWidgets.getName()
		);
		if (!viewWidgetsFilterValues.isEmpty()) {
			return super.getSpecification(bc)
					.and(getSpecForViewWidgetsField(viewWidgetsFilterValues))
					.and(getFilterSpecification());
		}
		return super.getSpecification(bc).and(getFilterSpecification());
	}


	@Override
	protected CreateResult<ResponsibilitesCrudDTO> doCreateEntity(Responsibilities entity, BusinessComponent bc) {
		entity.setResponsibilityType(ResponsibilityType.VIEW);
		entity.setDepartmentId(DEFAULT_DEPARTMENT_ID);
		entity.setReadOnly(false);
		responsibilitiesServiceExt.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<ResponsibilitesCrudDTO> deleteEntity(BusinessComponent bc) {
		super.deleteEntity(bc);
		responsibilitiesServiceExt.refreshCacheAfterTx();
		return new ActionResultDTO<>();
	}

	@Override
	protected ActionResultDTO<ResponsibilitesCrudDTO> doUpdateEntity(Responsibilities entity,
			ResponsibilitesCrudDTO data,
			BusinessComponent bc) {
		setIfChanged(data, ResponsibilitesCrudDTO_.view, entity::setView);
		setIfChanged(data, ResponsibilitesCrudDTO_.screens, entity::setScreens);
		setIfChanged(data, ResponsibilitesCrudDTO_.respType, entity::setResponsibilityType);
		setIfChanged(data, ResponsibilitesCrudDTO_.readOnly, entity::setReadOnly);
		setMappedIfChanged(data, ResponsibilitesCrudDTO_.internalRoleCD, entity::setInternalRoleCD, val -> ofNullable(val)
				.map(InternalRole::key)
				.orElse(null));

		responsibilitiesServiceExt.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));

	}

	@Override
	public ResponsibilitesCrudDTO entityToDto(final BusinessComponent bc, final Responsibilities entity) {
		ResponsibilitesCrudDTO responsibilitesCrudDTO = super.entityToDto(bc, entity);
		Map<String, String> viewWidgetsNameToDescription = responsibilitiesServiceExt.getViewWidgetsNameToDescription(entity.getView());
		responsibilitesCrudDTO.setViewWidgets(viewWidgetsNameToDescription.entrySet().stream().collect(
				MultivalueField.toMultivalueField(Entry::getKey, Entry::getValue)));
		return responsibilitesCrudDTO;
	}

	@Override
	public Actions<ResponsibilitesCrudDTO> getActions() {
		return Actions.<ResponsibilitesCrudDTO>builder()
				.create(crt -> crt.text("Add"))
				.save(sv -> sv)
				.delete(dlt -> dlt.text("Delete"))
				.action(act -> act
						.action("edit", "Edit")
				)
				.action(act -> act
						.action("refreshRespCache", "Refresh Cache")
						.scope(ActionScope.BC)
						.invoker((data, bc) -> {
							responsibilitiesServiceExt.refreshCacheAfterTx();
							return new ActionResultDTO<ResponsibilitesCrudDTO>().setAction(PostAction.refreshBc(CxboxRestController.responsibilities));
						})
				)
				.build();
	}

	private @NotNull Specification<Responsibilities> getSpecForViewWidgetsField(List<String> filterCustomField) {
		Set<String> widgetNames = responsibilitiesServiceExt.getAllWidgetsNameToDescription().entrySet()
				.stream()
				.filter(entry -> filterCustomField.contains(entry.getValue())).map(Entry::getKey)
				.collect(Collectors.toSet());
		Set<String> viewNames = responsibilitiesServiceExt.getViewsByWidgetNames(widgetNames);
		return (root, cq, cb) -> root.get(Responsibilities_.view).in(viewNames);
	}

	private List<String> getFilterFieldName(QueryParameters queryParameters, String fieldName) {
		return queryParameters.getFilter().getParameters().stream()
				.filter(f -> f.getName().contains(fieldName))
				.map(FilterParameter::getStringValuesAsList)
				.findFirst().orElse(new ArrayList<>());
	}

	private Specification<Responsibilities> getFilterSpecification() {
		return (root, cq, cb) -> cb.and(
				cb.isNotNull(root.get(Responsibilities_.responsibilityType)),
				cb.notEqual(root.get(Responsibilities_.responsibilityType), ResponsibilityType.SCREEN)
		);
	}

}

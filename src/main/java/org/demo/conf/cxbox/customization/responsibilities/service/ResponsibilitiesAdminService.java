package org.demo.conf.cxbox.customization.responsibilities.service;

import static org.demo.conf.cxbox.customization.responsibilities.dto.ResponsibilitiesAdminDTO_.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import org.cxbox.core.controller.param.FilterParameter;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;

import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;

import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.cxbox.core.file.service.CxboxFileService;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.meta.entity.Responsibilities;

import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.cxbox.meta.entity.Responsibilities_;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.customization.responsibilities.dto.ResponsibilitiesAdminDTO;
import org.demo.conf.cxbox.customization.metaAdmin.MetaAdminServiceExt;

import org.demo.conf.cxbox.customization.responsibilities.dto.ResponsibilitiesAdminDTO_;
import org.demo.util.CSVUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S6813"})
@Service
public class ResponsibilitiesAdminService extends VersionAwareResponseService<ResponsibilitiesAdminDTO, Responsibilities> {

	@Autowired
	private MetaAdminServiceExt metaAdminServiceExt;

	@Autowired
	private JpaDao jpaDao;

	@Autowired
	private CxboxFileService cxboxFileService;

	public ResponsibilitiesAdminService() {
		super(ResponsibilitiesAdminDTO.class, Responsibilities.class, null, ResponsibilitiesAdminMeta.class);
	}

	@Override
	public Specification<Responsibilities> getSpecification(BusinessComponent bc) {
		List<String> viewWidgetsFilterValues = getFilterFieldName(
				bc.getParameters(),
				viewWidgets.getName()
		);
		if (!viewWidgetsFilterValues.isEmpty()) {
			return super.getSpecification(bc)
					.and(getSpecForViewWidgetsField(viewWidgetsFilterValues))
					.and(getFilterSpecification());
		}
		return super.getSpecification(bc).and(getFilterSpecification());
	}


	@Override
	protected CreateResult<ResponsibilitiesAdminDTO> doCreateEntity(Responsibilities entity, BusinessComponent bc) {
		entity.setResponsibilityType(ResponsibilityType.VIEW);
		entity.setReadOnly(false);
		jpaDao.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<ResponsibilitiesAdminDTO> deleteEntity(BusinessComponent bc) {
		super.deleteEntity(bc);
		return new ActionResultDTO<>();
	}

	@Override
	protected ActionResultDTO<ResponsibilitiesAdminDTO> doUpdateEntity(Responsibilities entity,
			ResponsibilitiesAdminDTO data,
			BusinessComponent bc) {
		String role = data.getInternalRoleCD();
		if (data.isFieldChanged(ResponsibilitiesAdminDTO_.internalRoleCD.getName())) {
			entity.setInternalRoleCD(role);
		}
		setIfChanged(data, ResponsibilitiesAdminDTO_.view, entity::setView);
		if (jpaDao.getCount(
				Responsibilities.class,
				(root, cq, cb) -> cb.and(
						cb.equal(root.get(Responsibilities_.internalRoleCD), role),
						cb.equal(root.get(Responsibilities_.view), entity.getView()),
						cb.equal(root.get(Responsibilities_.responsibilityType), ResponsibilityType.VIEW),
						cb.notEqual(root.get(Responsibilities_.id), bc.getIdAsLong())
				)
		) > 0) {
			entity.setView(null);
		}
		jpaDao.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ResponsibilitiesAdminDTO entityToDto(final BusinessComponent bc, final Responsibilities entity) {
		ResponsibilitiesAdminDTO responsibilitiesAdminDTO = super.entityToDto(bc, entity);
		Map<String, String> viewWidgetsNameToDescription = metaAdminServiceExt.getViewWidgetsNameToDescription(entity.getView());
		responsibilitiesAdminDTO.setViewWidgets(viewWidgetsNameToDescription.entrySet().stream().collect(
				MultivalueField.toMultivalueField(Entry::getKey, Entry::getValue)));
		return responsibilitiesAdminDTO;
	}

	@SneakyThrows
	@Override
	public Actions<ResponsibilitiesAdminDTO> getActions() {
		return Actions.<ResponsibilitiesAdminDTO>builder()
				.create(crt -> crt.text("Create"))
				.save(sv -> sv.text("Save"))
				.cancelCreate(ccr -> ccr.text("Cancel"))
				.delete(dlt -> dlt.text("Delete"))
				.action(act -> act
						.action("clear_cache", "Clear Cache")
						.scope(ActionScope.BC)
						.invoker((data, bc) -> {
							metaAdminServiceExt.refreshCacheAfterTx();
							return new ActionResultDTO<>();
						})
				)
				.action(act -> act
						.action("export_liquibase", "Export")
						.scope(ActionScope.BC)
						.invoker((data, bc) -> {
							metaAdminServiceExt.refreshCacheAfterTx();
							return new ActionResultDTO<ResponsibilitiesAdminDTO>().setAction(PostAction.downloadFile(cxboxFileService.upload(
									toCsv(),
									null
							)));
						})
				)
				.build();
	}

	@SneakyThrows
	@NotNull
	public FileDownloadDto toCsv() {
		String name = "RESPONSIBILITIES.csv";
		var header = List.of("INTERNAL_ROLE_CD", "RESPONSIBILITIES", "ID");
		var body = jpaDao.getList(Responsibilities.class).stream()
				.filter(e -> ResponsibilityType.VIEW.equals(e.getResponsibilityType()))
				.sorted(Comparator.comparing(Responsibilities::getInternalRoleCD)
						.thenComparing(Responsibilities::getView)
						.thenComparing(Responsibilities::getCreatedDate)
						.thenComparing(Responsibilities::getId)
				)
				.map(e -> List.of(e.getInternalRoleCD(), e.getView(), ""));
		return CSVUtils.toCsv(header, body, name, ";");
	}

	private Specification<Responsibilities> getSpecForViewWidgetsField(List<String> filterCustomField) {
		Set<String> widgetNames = metaAdminServiceExt.getAllWidgetsNameToDescription().entrySet()
				.stream()
				.filter(entry -> filterCustomField.contains(entry.getValue())).map(Entry::getKey)
				.collect(Collectors.toSet());
		Set<String> viewNames = metaAdminServiceExt.getViewsByWidgetNames(widgetNames);
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

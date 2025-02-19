package org.demo.conf.cxbox.customization.responsibilitiesAction.service;

import static org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO_.actionKey;
import static org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO_.view;
import static org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO_.widget;

import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.cxbox.core.file.service.CxboxFileService;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.meta.entity.ResponsibilitiesAction;
import org.cxbox.meta.metahotreload.dto.WidgetSourceDTO;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.customization.metaAdmin.MetaAdminServiceExt;
import org.demo.conf.cxbox.customization.responsibilitiesAction.dto.ResponsibilitiesActionAdminDTO;
import org.demo.util.CSVUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S6813", "java:S1170"})
@Service
@RequiredArgsConstructor
public class ResponsibilitiesActionAdminService extends
		VersionAwareResponseService<ResponsibilitiesActionAdminDTO, ResponsibilitiesAction> {

	private final MetaAdminServiceExt metaAdminServiceExt;

	private Map<String, WidgetSourceDTO> nameToWidget;

	private final JpaDao jpaDao;

	private final CxboxFileService cxboxFileService;

	@Getter(onMethod_ = @Override)
	private final Class<ResponsibilitiesActionAdminMeta> meta = ResponsibilitiesActionAdminMeta.class;

	@Override
	protected CreateResult<ResponsibilitiesActionAdminDTO> doCreateEntity(ResponsibilitiesAction entity,
			BusinessComponent bc) {
		jpaDao.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<ResponsibilitiesActionAdminDTO> deleteEntity(BusinessComponent bc) {
		super.deleteEntity(bc);
		return new ActionResultDTO<>();
	}

	@Override
	protected ActionResultDTO<ResponsibilitiesActionAdminDTO> doUpdateEntity(ResponsibilitiesAction entity,
			ResponsibilitiesActionAdminDTO data,
			BusinessComponent bc) {
		String internalRoleCD = data.getInternalRoleCD();
		if (data.isFieldChanged(internalRoleCD)) {
			entity.setInternalRoleCD(internalRoleCD);
		}
		setIfChanged(data, view, entity::setView);
		setIfChanged(data, widget, entity::setWidget);
		setIfChanged(data, actionKey, entity::setAction);
		jpaDao.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ResponsibilitiesActionAdminDTO entityToDto(final BusinessComponent bc, final ResponsibilitiesAction entity) {
		ResponsibilitiesActionAdminDTO dto = super.entityToDto(bc, entity);
		dto.setBc(Optional
				.ofNullable(nameToWidget.getOrDefault(entity.getWidget(), null))
				.map(WidgetSourceDTO::getBc)
				.orElse(null));
		return dto;
	}

	@SneakyThrows
	@Override
	public Actions<ResponsibilitiesActionAdminDTO> getActions() {
		return Actions.<ResponsibilitiesActionAdminDTO>builder()
				.save(sv -> sv.text("Save"))
				.create(crt -> crt.text("Create"))
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
							return new ActionResultDTO<ResponsibilitiesActionAdminDTO>().setAction(PostAction.downloadFile(
									cxboxFileService.upload(
											toCsv(),
											null
									)));
						})
				)
				.build();
	}

	@SneakyThrows
	@NotNull
	private FileDownloadDto toCsv() {
		String name = "RESPONSIBILITIES_ACTION.csv";
		var header = List.of("INTERNAL_ROLE_CD;ACTION;VIEW;WIDGET;ID");
		var body = jpaDao.getList(ResponsibilitiesAction.class).stream()
				.sorted(Comparator.comparing(ResponsibilitiesAction::getInternalRoleCD)
						.thenComparing(ResponsibilitiesAction::getAction)
						.thenComparing(ResponsibilitiesAction::getView)
						.thenComparing(ResponsibilitiesAction::getWidget)
						.thenComparing(ResponsibilitiesAction::getId)
				)
				.map(e -> List.of(e.getInternalRoleCD(), e.getAction(), e.getView(), e.getWidget(), ""));

		return CSVUtils.toCsv(header, body, name, ";");
	}

	@PostConstruct
	public void init() {
		this.nameToWidget = Collections.unmodifiableMap(metaAdminServiceExt.getAllWidgets());
	}

}

package org.demo.service.cxbox.inner.core;

import static java.util.Optional.ofNullable;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
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
import org.cxbox.meta.metahotreload.dto.WidgetSourceDTO;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.demo.conf.cxbox.extension.resposibilities.ResponsibilitiesServiceExt;
import org.demo.dto.cxbox.inner.core.RoleActionDTO;
import org.demo.dto.cxbox.inner.core.RoleActionDTO_;
import org.demo.entity.core.RoleAction;
import org.demo.entity.dictionary.InternalRole;
import org.demo.repository.core.RoleActionRepository;
import org.demo.util.CSVUtils;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S6813"})
@Service
public class RoleActionService extends VersionAwareResponseService<RoleActionDTO, RoleAction> {

	private final Map<String, WidgetSourceDTO> nameToWidget;

	@Autowired
	private ResponsibilitiesServiceExt responsibilitiesServiceExt;

	@Autowired
	private RoleActionRepository responsibilitiesRepository;

	@Autowired
	private CxboxFileService cxboxFileService;

	public RoleActionService(@Autowired MetaResourceReaderService metaResourceReaderService) {
		super(RoleActionDTO.class, RoleAction.class, null, RoleActionMeta.class);
		this.nameToWidget = metaResourceReaderService.getWidgets().stream()
				.collect(Collectors.toMap(WidgetSourceDTO::getName, e -> e));
	}

	@Override
	protected CreateResult<RoleActionDTO> doCreateEntity(RoleAction entity, BusinessComponent bc) {
		responsibilitiesRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<RoleActionDTO> deleteEntity(BusinessComponent bc) {
		super.deleteEntity(bc);
		return new ActionResultDTO<>();
	}

	@Override
	protected ActionResultDTO<RoleActionDTO> doUpdateEntity(RoleAction entity,
			RoleActionDTO data,
			BusinessComponent bc) {
		String internalRoleCD = ofNullable(data.getInternalRoleCD())
				.map(InternalRole::key)
				.orElse(null);
		if (data.isFieldChanged(RoleActionDTO_.internalRoleCD)) {
			entity.setInternalRoleCD(internalRoleCD);
		}
		setIfChanged(data, RoleActionDTO_.view, entity::setView);
		setIfChanged(data, RoleActionDTO_.widget, entity::setWidget);
		setIfChanged(data, RoleActionDTO_.action, entity::setAction);
		responsibilitiesRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public RoleActionDTO entityToDto(final BusinessComponent bc, final RoleAction entity) {
		RoleActionDTO dto = super.entityToDto(bc, entity);
		dto.setBc(Optional
				.ofNullable(nameToWidget.getOrDefault(entity.getWidget(), null))
				.map(WidgetSourceDTO::getBc)
				.orElse(null));
		return dto;
	}

	@SneakyThrows
	@Override
	public Actions<RoleActionDTO> getActions() {
		return Actions.<RoleActionDTO>builder()
				.create(crt -> crt.text("Create"))
				.save(sv -> sv)
				.delete(dlt -> dlt.text("Delete"))
				.action(act -> act
						.action("clear_cache", "Clear Cache")
						.scope(ActionScope.BC)
						.invoker((data, bc) -> {
							responsibilitiesServiceExt.refreshCacheAfterTx();
							return new ActionResultDTO<>();
						})
				)
				.action(act -> act
						.action("export_liquibase", "Export")
						.scope(ActionScope.BC)
						.invoker((data, bc) -> {
							responsibilitiesServiceExt.refreshCacheAfterTx();
							return new ActionResultDTO<RoleActionDTO>().setAction(PostAction.downloadFile(cxboxFileService.upload(
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
		String name = "ROLE_ACTION.csv";
		var header = List.of("INTERNAL_ROLE_CD;ACTION;VIEW;WIDGET;ID");
		var body = responsibilitiesRepository.findAll().stream()
				.sorted(Comparator.comparing(RoleAction::getInternalRoleCD)
						.thenComparing(RoleAction::getAction)
						.thenComparing(RoleAction::getView)
						.thenComparing(RoleAction::getWidget)
						.thenComparing(RoleAction::getId)
				)
				.map(e -> List.of(e.getInternalRoleCD(), e.getAction(), e.getView(), e.getWidget(), ""));

		return CSVUtils.toCsv(header, body, name, ";");
	}

}

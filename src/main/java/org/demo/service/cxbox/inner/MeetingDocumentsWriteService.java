package org.demo.service.cxbox.inner;

import static org.demo.dto.cxbox.inner.MeetingDocumentsDTO_.notes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.api.data.dto.AssociateDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.AssociateResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.cxbox.core.file.service.CxboxFileService;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO_;
import org.demo.entity.Meeting;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.MeetingDocuments_;
import org.demo.repository.MeetingDocumentsRepository;
import org.demo.repository.MeetingRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;


@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class MeetingDocumentsWriteService extends VersionAwareResponseService<MeetingDocumentsDTO, MeetingDocuments> {

	private final MeetingDocumentsRepository meetingDocumentsRepository;

	private final MeetingRepository meetingRepository;

	private final CxboxFileService cxboxFileService;

	@Getter(onMethod_ = @Override)
	private final Class<MeetingDocumentsWriteMeta> meta = MeetingDocumentsWriteMeta.class;

	@Override
	protected Specification<MeetingDocuments> getParentSpecification(BusinessComponent bc) {
		return (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(root.get(MeetingDocuments_.meeting).get(BaseEntity_.id), bc.getParentIdAsLong())
		);

	}

	@Override
	protected CreateResult<MeetingDocumentsDTO> doCreateEntity(MeetingDocuments entity, BusinessComponent bc) {
		Meeting meeting = meetingRepository.findById(bc.getParentIdAsLong()).orElse(null);
		entity.setMeeting(meeting);
		meetingDocumentsRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MeetingDocumentsDTO> doUpdateEntity(MeetingDocuments entity, MeetingDocumentsDTO data,
			BusinessComponent bc) {
		setIfChanged(data, MeetingDocumentsDTO_.priority, entity::setPriority);
		if (data.isFieldChanged(MeetingDocumentsDTO_.fileId)) {
			entity.setFileId(data.getFileId());
		}
		if (data.isFieldChanged(MeetingDocumentsDTO_.file)) {
			entity.setFile(data.getFile());
		}
		if (data.isFieldChanged(MeetingDocumentsDTO_.document)) {
			entity.setDocument(data.getDocument());
		}
		if (data.isFieldChanged(MeetingDocumentsDTO_.briefing)) {
			entity.setBriefing(data.getBriefing());
		}
		setIfChanged(data, notes, entity::setNotes);

		meetingDocumentsRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO onCancel(BusinessComponent bc) {
		return new ActionResultDTO<>().setAction(PostAction.drillDown(
				DrillDownType.INNER,
				"/screen/meeting/"
		));
	}


	@Override
	protected AssociateResultDTO doAssociate(List<AssociateDTO> data, BusinessComponent bc) {
		List<MeetingDocuments> meetingDocuments = fileUpload(bc, data);
		List<MeetingDocumentsDTO> collect = meetingDocuments.stream().map(e -> entityToDto(bc, e))
				.collect(Collectors.toList());
		return new AssociateResultDTO((List) collect);
	}

	@SneakyThrows
	private List<MeetingDocuments> fileUpload(BusinessComponent bc, List<AssociateDTO> fileIds) {
		List<MeetingDocuments> meetingDocumentsList = new ArrayList<>();
		Optional<Meeting> meeting = meetingRepository.findById(Long.valueOf(bc.getParentIdAsLong()));
		for (AssociateDTO item : fileIds) {
			var meetingDocuments = new MeetingDocuments();
			var fileId = item.getId();
			FileDownloadDto download = cxboxFileService.download(fileId, null);
			meetingDocuments.setMeeting(meeting.get());
			meetingDocuments.setFileId(fileId);
			meetingDocuments.setFile(download.getName());
			meetingDocumentsList.add(meetingDocumentsRepository.save(meetingDocuments));

		}
		return meetingDocumentsList;
	}

	@Override
	public Actions<MeetingDocumentsDTO> getActions() {
		return Actions.<MeetingDocumentsDTO>builder()
				.create(crt -> crt.text("Add"))
				.save(sv -> sv)
				.action(act -> act
						.scope(ActionScope.RECORD)
						.withAutoSaveBefore()
						.action("saveAndContinue", "Save")
						.invoker((bc, dto) -> new ActionResultDTO<MeetingDocumentsDTO>().setAction(
								PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/meeting/view/meetingview/" + CxboxRestController.meeting + "/" + bc.getId()
								)))
				)
				.cancelCreate(ccr -> ccr.text("Cancel").available(bc -> true))
				.associate(ast -> ast
						.withCustomParameter(Map.of("subtype", "multiFileUpload"))
						.text("Add Files")
				)
				.delete(dlt -> dlt)
				.build();
	}

	private ActionsBuilder<MeetingDocumentsDTO> addEditAction(ActionsBuilder<MeetingDocumentsDTO> builder) {
		return builder
				.action(act -> act
						.action("edit", "Edit")
						.scope(ActionScope.RECORD)
						.withoutAutoSaveBefore()
						.invoker((bc, data) -> new ActionResultDTO<MeetingDocumentsDTO>()
								.setAction(PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/meeting/view/meetingedit/" +
												CxboxRestController.meetingEdit + "/" +
												bc.getId()
								)))
				);
	}

}

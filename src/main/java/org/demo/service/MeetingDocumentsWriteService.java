package org.demo.service;

import static org.demo.dto.MeetingDocumentsDTO_.notes;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDocumentsDTO;
import org.demo.dto.MeetingDocumentsDTO_;
import org.demo.entity.Meeting;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.MeetingDocuments_;
import org.demo.repository.MeetingDocumentsRepository;
import org.demo.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.Base64Utils;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingDocumentsWriteService extends VersionAwareResponseService<MeetingDocumentsDTO, MeetingDocuments> {

	@Autowired
	private MeetingDocumentsRepository meetingDocumentsRepository;

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	CustomFileServices customFileServices;

	public MeetingDocumentsWriteService() {
		super(MeetingDocumentsDTO.class, MeetingDocuments.class, null, MeetingDocumentsWriteMeta.class);
	}

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
		if (data.isFieldChanged(MeetingDocumentsDTO_.documentType)) {
			entity.setDocumentType(data.getDocumentType());
		}
		if (data.isFieldChanged(MeetingDocumentsDTO_.fileId)) {
			entity.setFileId(data.getFileId());
		}
		if (data.isFieldChanged(MeetingDocumentsDTO_.file)) {
			entity.setFile(data.getFile());
			if (data.getFileId() != null) {
				entity.setFieldKeyForContentType(customFileServices.getStatData(data.getFileId()).contentType());
				entity.setFieldKeyForBase64(Base64Utils.encode(customFileServices.getObject(data.getFileId())));
			}
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
	public Actions<MeetingDocumentsDTO> getActions() {
		return Actions.<MeetingDocumentsDTO>builder()
				.create().text("Добавить").add()
				.delete().text("Удалить").add()
				.save().text("Сохранить").add()
				.newAction()
				.scope(ActionScope.RECORD)
				.withAutoSaveBefore()
				.action("saveAndContinue", "Save")
				.invoker((bc, dto) -> new ActionResultDTO<MeetingDocumentsDTO>().setAction(
						PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/meeting/view/meetingview/" + CxboxRestController.meeting + "/" + bc.getId()
						)))
				.add()
				.cancelCreate().text("Cancel").available(bc -> true).add()
				.newAction()
				.action("multiFileUpload", "Add files")
				.scope(ActionScope.BC)
				.withoutAutoSaveBefore()
				.invoker((bc, data) -> new ActionResultDTO<>())
				.add()
				.build();
	}

	private ActionsBuilder<MeetingDocumentsDTO> addEditAction(ActionsBuilder<MeetingDocumentsDTO> builder) {
		return builder
				.newAction()
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
				.add();
	}

}

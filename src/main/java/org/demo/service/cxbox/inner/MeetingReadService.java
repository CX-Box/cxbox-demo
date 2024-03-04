package org.demo.service.cxbox.inner;

import org.cxbox.core.service.action.CxboxActionIconSpecifier;
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDTO;
import org.demo.entity.Meeting;
import org.demo.repository.MeetingRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.util.session.SessionService;
import org.demo.repository.core.UserRepository;
import org.demo.service.statemodel.MeetingStatusModelActionProvider;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingReadService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private final MeetingRepository meetingRepository;

	private final UserRepository userRepository;

	private final SessionService sessionService;

	private final MeetingStatusModelActionProvider statusModelActionProvider;

	public MeetingReadService(MeetingRepository meetingRepository, UserRepository userRepository, SessionService sessionService,
			MeetingStatusModelActionProvider statusModelActionProvider) {
		super(MeetingDTO.class, Meeting.class, null, MeetingReadMeta.class);
		this.meetingRepository = meetingRepository;
		this.userRepository = userRepository;
		this.sessionService = sessionService;
		this.statusModelActionProvider = statusModelActionProvider;
	}

	@Override
	protected CreateResult<MeetingDTO> doCreateEntity(Meeting entity, BusinessComponent bc) {
		entity.setResponsible(userRepository.getReferenceById(sessionService.getSessionUser().getId()));
		meetingRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						String.format(
								"/screen/meeting/view/meetingedit/%s/%s",
								CxboxRestController.meetingEdit,
								entity.getId()
						)
				));
	}

	@Override
	protected ActionResultDTO<MeetingDTO> doUpdateEntity(Meeting entity, MeetingDTO data, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	public Actions<MeetingDTO> getActions() {
		return Actions.<MeetingDTO>builder()
				.create().text("Add").add()
				.cancelCreate().text("Cancel").withIcon(CxboxActionIconSpecifier.CLOSE, false).add()
				.addGroup(
						"actions",
						"Actions",
						0,
						addEditAction(statusModelActionProvider.getMeetingActions()).build()
				)
				.withIcon(ActionIcon.MENU, false)
				.build();
	}

	private ActionsBuilder<MeetingDTO> addEditAction(ActionsBuilder<MeetingDTO> builder) {
		return builder
				.newAction()
				.action("edit", "Edit")
				.scope(ActionScope.RECORD)
				.withoutAutoSaveBefore()
				.invoker((bc, data) -> new ActionResultDTO<MeetingDTO>()
						.setAction(PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/meeting/view/meetingedit/" +
										CxboxRestController.meetingEdit + "/" +
										bc.getId()
						)))
				.add();
	}


	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}

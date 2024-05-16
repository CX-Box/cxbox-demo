package org.demo.service.cxbox.inner;

import java.util.Optional;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.MessageType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.service.action.CxboxActionIconSpecifier;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.repository.MeetingRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.mail.MailSendingService;
import org.demo.service.statemodel.MeetingStatusModelActionProvider;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingReadService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private final MeetingRepository meetingRepository;

	private final UserRepository userRepository;

	private final SessionService sessionService;

	private final MeetingStatusModelActionProvider statusModelActionProvider;

	private final MailSendingService mailSendingService;

	private static final String MESSAGE_TEMPLATE = "Status: %s; \nMeeting Result: %s";

	public MeetingReadService(MeetingRepository meetingRepository, UserRepository userRepository,
			SessionService sessionService,
			MeetingStatusModelActionProvider statusModelActionProvider, MailSendingService mailSendingService) {
		super(MeetingDTO.class, Meeting.class, null, MeetingReadMeta.class);
		this.meetingRepository = meetingRepository;
		this.userRepository = userRepository;
		this.sessionService = sessionService;
		this.statusModelActionProvider = statusModelActionProvider;
		this.mailSendingService = mailSendingService;
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
				.newAction()
				.action("sendEmail", "Send Email")
				.scope(ActionScope.RECORD)
				.invoker((bc, data) -> {
					Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
					getSend(meeting);
					return new ActionResultDTO<MeetingDTO>()
							.setAction(PostAction.showMessage(MessageType.INFO, "The email is currently being sent."));
				})
				.add()
				.addGroup(
						"actions",
						"Actions",
						0,
						addEditAction(statusModelActionProvider.getMeetingActions()).build()
				)
				.withIcon(ActionIcon.MENU, false)

				.build();
	}

	private void getSend(Meeting meeting) {
		mailSendingService.send(
				Optional.ofNullable(meeting).map(Meeting::getContact).map(Contact::getEmail),
				meeting.getAgenda(),
				String.format(MESSAGE_TEMPLATE, meeting.getStatus().getValue(), meeting.getResult()),
				userRepository.getReferenceById(sessionService.getSessionUser().getId())
		);
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

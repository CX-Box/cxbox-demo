package org.demo.service.statemodel;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.dto.rowmeta.PreActionType;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.util.session.SessionService;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.MeetingRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.mail.MailSendingService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeetingStatusModelActionProvider {

	private final MeetingRepository meetingRepository;

	private final MailSendingService mailSendingService;

	private final SessionService sessionService;

	private final UserRepository userRepository;

	private final String messageTemplate = "Status: %s; \nMeeting Result: %s";

	public ActionsBuilder<MeetingDTO> getMeetingActions() {
		ActionsBuilder<MeetingDTO> builder = Actions.builder();
		Arrays.stream(MeetingStatus.values()).sequential()
				.forEach(status -> builder.action(act -> act.action(status.getValue(), status.getButton())
						.invoker((bc, dto) -> {
							Meeting meeting = meetingRepository.getById(Long.parseLong(bc.getId()));
							status.transition(status, meeting);
							if (meeting.getStatus().equals(MeetingStatus.WAIT_SEND_MAIL)) {
								mailSendingService.send(
										Optional.ofNullable(meeting),
										meeting.getAgenda(),
										String.format(messageTemplate, MeetingStatus.COMPLETED.getValue(), meeting.getResult()),
										sessionService.getSessionUser()
								);
							}

							if (meeting.getStatus().equals(MeetingStatus.IN_COMPLETION)) {
								return new ActionResultDTO<MeetingDTO>().setAction(PostAction.drillDownAndWaitUntil(
										"/screen/meeting/view/meetingedit/"
												+ CxboxRestController.meetingEdit + "/"
												+ meeting.getId(),
										CxboxRestController.meetingEdit, MeetingDTO_.status, MeetingStatus.IN_COMPLETION)
										.successMessage("status changed to IN_COMPLETION successfully")
										.timeoutMessage("status was not changed to IN_COMPLETION till timeout. Refresh screen manually")
										.build()
								);
							}
							return new ActionResultDTO<MeetingDTO>().setAction(PostAction.refreshBc(bc.getDescription()));
						})
						.available(bc -> {
							if (bc.getId() == null) {
								return false;
							}
							Meeting meeting = meetingRepository.getById(Long.parseLong(bc.getId()));
							return meeting.getStatus().available(meeting).contains(status);
						})
						.withPreAction(PreAction.builder().preActionType(PreActionType.CONFIRMATION)
								.message("Do You confirm the action on the meeting?")
								.customParameters(Map.of("okText", status.getButton(), "cancelText", "Back to meeting list"))
								.build())
						.scope(ActionScope.RECORD)
				));
		return builder;
	}

}

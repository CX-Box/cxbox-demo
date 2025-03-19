package org.demo.service.statemodel;

import java.time.Duration;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.dto.DrillDownType;
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
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.MeetingRepository;
import org.demo.service.mail.MailSendingService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeetingStatusModelActionProvider {

	private final MeetingRepository meetingRepository;

	private final MailSendingService mailSendingService;

	private final SessionService sessionService;

	private final String messageTemplate = "Status: %s; \nMeeting Result: %s";

	public ActionsBuilder<MeetingDTO> getMeetingActions() {
		ActionsBuilder<MeetingDTO> builder = Actions.builder();
		Arrays.stream(MeetingStatus.values()).sequential()
				.forEach(status -> builder.action(act -> act.action(status.getValue(), status.getButton())
						.invoker((bc, dto) -> {
							Meeting meeting = meetingRepository.getById(Long.parseLong(bc.getId()));
							if (!meeting.getStatus().equals(MeetingStatus.COMPLETED)) {
								status.transition(status, meeting);
							}
							if (meeting.getStatus().equals(MeetingStatus.COMPLETED)) {
								mailSendingService.send(
										Optional.ofNullable(meeting),
										meeting.getAgenda(),
										String.format(messageTemplate, MeetingStatus.COMPLETED.getValue(), meeting.getResult()),
										sessionService.getSessionUser()
								);
								return new ActionResultDTO<MeetingDTO>().setAction(PostAction.waitUntil(
														MeetingDTO_.status, MeetingStatus.COMPLETED
												)
												.timeout(Duration.ofSeconds(5))
												.successMessage("status changed to COMPLETION successfully")
												.timeoutMessage("status was not changed to COMPLETION till timeout. Refresh screen manually")
												.build()
								);
							}

							if (meeting.getStatus().equals(MeetingStatus.IN_COMPLETION)) {
								return new ActionResultDTO<MeetingDTO>().setAction(PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/meeting/view/meetingedit/"
												+ CxboxRestController.meetingEdit + "/"
												+ meeting.getId()
								));
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

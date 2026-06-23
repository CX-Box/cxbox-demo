package org.demo.service.cxbox.inner;

import java.time.LocalDateTime;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.MessageType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionInvoker;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.service.action.CxboxActionIconSpecifier;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.entity.Meeting;
import org.demo.repository.MeetingRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.mail.MailSendingService;
import org.demo.service.statemodel.MeetingStatusModelActionProvider;
import org.jobrunr.scheduling.BackgroundJob;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class MeetingReadService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private static final String MESSAGE_TEMPLATE = "Status: %s; \nMeeting Result: %s";

	private final MeetingRepository meetingRepository;

	private final UserRepository userRepository;

	private final SessionService sessionService;

	private final MeetingStatusModelActionProvider statusModelActionProvider;

	private final MailSendingService mailSendingService;

	@Getter(onMethod_ = @Override)
	private final Class<MeetingReadMeta> meta = MeetingReadMeta.class;

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
				.create(crt -> crt.text("Add"))
				.cancelCreate(ccr -> ccr.text("Cancel").withIcon(CxboxActionIconSpecifier.CLOSE, false))
				.addGroup(
						"actions",
						"Actions",
						0,
						addEditAction(statusModelActionProvider.getMeetingActions()).build()
				)
				.withIcon(ActionIcon.MENU, false)
				.action(act -> act
						.action("sendEmail", "Send Email")
						.invoker((bc, data) -> {
							Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
							getSend(meeting, false);
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.showMessage(MessageType.INFO, "Create action on the email sent."));
						})
				)
				.action(act -> act
						.action("sendEmailNextDay", "Send Email Next Day")
						.invoker((bc, data) -> {
							BackgroundJob.<MailSendingService>schedule(
									LocalDateTime.now().plusDays(1),
									x -> x.stats("save pressed job")
							);
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.showMessage(MessageType.INFO, "The email will be dispatched tomorrow."));
						})
				)

				.action(act -> act
						.action("postActionDD", "Post Action DD Meeting No Work")
						.scope(ActionScope.BC)
						.available(bc -> {
							// TODO: Write action availability condition here
							return true;
						})
						.invoker((bc, dto) -> {

							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/meeting/view/meeting/"
													+ CxboxRestController.meetingEdit + "/"
													+ bc.getId()
									));
						})
				)
				.action(act -> act
						.action("postActionDD2", "Post Action DD Client No Work")
						.scope(ActionScope.BC)
						.available(bc -> {
							// TODO: Write action availability condition here
							return true;
						})
						.invoker((bc, dto) -> {
							// TODO: Write action processing code here
							Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/client/view/clientview/"
													+ CxboxRestController.clientEdit + "/"
													+ meeting.getClient().getId()
									));
						})
				)
				.action(act -> act
						.action("refreshNoWork", "Refresh No Work")
						.scope(ActionScope.BC)
						.available(bc -> {
							// TODO: Write action availability condition here
							return true;
						})
						.invoker((bc, dto) -> {
							// TODO: Write action processing code here
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.refreshBc(CxboxRestController.meeting)
									);
						})
				)
				.action(act -> act
						.action("refresh", "Refresh Work")
						.scope(ActionScope.BC)
						.available(bc -> {
							return true;
						})
						.invoker((bc, dto) -> {
							// TODO: Write action processing code here
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.refreshBc(CxboxRestController.meeting)
									);
						})
						.updateRequired(false)

				)
				.action(act -> act
						.action("postActionDDWork", "Post Action DD Meeting Work")
						.scope(ActionScope.BC)
						.available(bc -> {
							// TODO: Write action availability condition here
							return true;
						})
						.invoker((bc, dto) -> {
							// TODO: Write action processing code here
							Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/client/view/clientview/"
													+ CxboxRestController.clientEdit + "/"
													+ meeting.getClient().getId()
									));
						})
						.updateRequired(false)

				)
				.action(act -> act
						.action("postActionDD2Work", "Post Action DD 2 Client Work")
						.scope(ActionScope.BC)
						.available(bc -> {
							// TODO: Write action availability condition here
							return true;
						})
						.invoker((bc, dto) -> {
							// TODO: Write action processing code here
							Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/client/view/clientview/"
													+ CxboxRestController.clientEdit + "/"
													+ meeting.getClient().getId()
									));
						})
						.updateRequired(false)
				)
				.build();
	}

	private void getSend(Meeting meeting, boolean isMass) {
		mailSendingService.send(
				Optional.ofNullable(meeting),
				meeting.getAgenda(),
				String.format(MESSAGE_TEMPLATE, meeting.getStatus().getValue(), meeting.getResult()),
				sessionService.getSessionUser(),
				isMass
		);
	}

	private ActionsBuilder<MeetingDTO> addEditAction(ActionsBuilder<MeetingDTO> builder) {
		return builder
				.action(act -> act
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
				);
	}


	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}

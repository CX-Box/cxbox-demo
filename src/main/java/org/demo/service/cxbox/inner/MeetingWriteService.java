package org.demo.service.cxbox.inner;

import static org.demo.dto.cxbox.inner.MeetingDTO_.address;
import static org.demo.dto.cxbox.inner.MeetingDTO_.agenda;
import static org.demo.dto.cxbox.inner.MeetingDTO_.clientId;
import static org.demo.dto.cxbox.inner.MeetingDTO_.contactId;
import static org.demo.dto.cxbox.inner.MeetingDTO_.endDateTime;
import static org.demo.dto.cxbox.inner.MeetingDTO_.notes;
import static org.demo.dto.cxbox.inner.MeetingDTO_.responsibleId;
import static org.demo.dto.cxbox.inner.MeetingDTO_.result;
import static org.demo.dto.cxbox.inner.MeetingDTO_.startDateTime;
import static org.demo.dto.cxbox.inner.MeetingDTO_.region;

import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
import lombok.NonNull;
import lombok.val;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.MessageType;
import org.cxbox.core.dto.multivalue.MultivalueFieldSingleValue;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.conf.cxbox.extension.action.ActionsExt;
import org.demo.conf.cxbox.extension.multivaluePrimary.MultivalueExt;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.mail.MailSendingService;
import org.demo.service.statemodel.MeetingStatusModelActionProvider;
import org.jobrunr.scheduling.BackgroundJob;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingWriteService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private final MeetingRepository meetingRepository;

	private final ClientRepository clientRepository;

	private final ContactRepository contactRepository;

	private final UserRepository userRepository;

	private final MeetingStatusModelActionProvider statusModelActionProvider;

	private final EntityManager entityManager;

	private final MailSendingService mailSendingService;

	private final SessionService sessionService;

	private static final String MESSAGE_TEMPLATE = "Status: %s; \nMeeting Result: %s";

	public MeetingWriteService(MeetingRepository meetingRepository, ClientRepository clientRepository,
			ContactRepository contactRepository, UserRepository userRepository,
			MeetingStatusModelActionProvider statusModelActionProvider, EntityManager entityManager,
			MailSendingService mailSendingService, SessionService sessionService) {
		super(MeetingDTO.class, Meeting.class, null, MeetingWriteMeta.class);
		this.meetingRepository = meetingRepository;
		this.clientRepository = clientRepository;
		this.contactRepository = contactRepository;
		this.userRepository = userRepository;
		this.statusModelActionProvider = statusModelActionProvider;
		this.entityManager = entityManager;
		this.mailSendingService = mailSendingService;
		this.sessionService = sessionService;
	}

	@Override
	protected CreateResult<MeetingDTO> doCreateEntity(Meeting entity, BusinessComponent bc) {
		meetingRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MeetingDTO> doUpdateEntity(Meeting entity, MeetingDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(MeetingDTO_.additionalContacts)) {
			entity.getAdditionalContacts().clear();
			entity.getAdditionalContacts().addAll(data.getAdditionalContacts().getValues().stream()
					.map(MultivalueFieldSingleValue::getId)
					.filter(Objects::nonNull)
					.map(Long::parseLong)
					.map(e -> entityManager.getReference(Contact.class, e))
					.toList());
			val primary = data.getAdditionalContacts().getValues().stream()
					.filter(e -> e.getOptions().get(MultivalueExt.PRIMARY) != null && e.getOptions().get(MultivalueExt.PRIMARY)
							.equalsIgnoreCase(Boolean.TRUE.toString())).findAny();
			primary.ifPresent(s -> entity.setAdditionalContactPrimaryId(Long.parseLong(s.getId())));
		}

		setIfChanged(data, agenda, entity::setAgenda);
		setIfChanged(data, startDateTime, entity::setStartDateTime);
		setIfChanged(data, endDateTime, entity::setEndDateTime);
		setIfChanged(data, region, entity::setRegion);
		setIfChanged(data, address, entity::setAddress);
		setIfChanged(data, notes, entity::setNotes);
		setIfChanged(data, result, entity::setResult);
		setMappedIfChanged(data, responsibleId, entity::setResponsible,
				id -> id != null ? userRepository.getReferenceById(id) : null
		);
		if (data.isFieldChanged(clientId)) {
			if (data.getClientId() != null) {
				entity.setClient(clientRepository.getReferenceById(data.getClientId()));
			} else {
				entity.setClient(null);
			}
			entity.setContact(null);
		}
		setMappedIfChanged(data, contactId, entity::setContact,
				id -> id != null ? contactRepository.getReferenceById(id) : null
		);
		meetingRepository.save(entity);
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
	public Actions<MeetingDTO> getActions() {
		return Actions.<MeetingDTO>builder()
				.create(crt -> crt.text("Add"))
				.save(sv -> sv)
				.addGroup(
						"actions",
						"Actions",
						0,
						addEditAction(statusModelActionProvider.getMeetingActions()).build()
				)
				.withIcon(ActionIcon.MENU, false)
				.action(act -> act
						.scope(ActionScope.RECORD)
						.withAutoSaveBefore()
						.action("saveAndContinue", "Save")
						.withPreAction(confirmWithComment("Approval"))
						.invoker((bc, dto) -> new ActionResultDTO<MeetingDTO>().setAction(
								PostAction.drillDown(
										DrillDownType.INNER,
										"/screen/meeting/view/meetingview/" + CxboxRestController.meeting + "/" + bc.getId()
								)))
				)
				.cancelCreate(ccr -> ccr.text("Cancel").available(bc -> true))
				.action(act -> act
						.action("sendEmail", "Send Email")
						.invoker((bc, data) -> {
							Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
							getSend(meeting);
							return new ActionResultDTO<MeetingDTO>()
									.setAction(PostAction.showMessage(MessageType.INFO, "The email is currently being sent."));
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

				.build();
	}

	private void getSend(Meeting meeting) {
		mailSendingService.send(
				Optional.ofNullable(meeting),
				meeting.getAgenda(),
				String.format(MESSAGE_TEMPLATE, meeting.getStatus().getValue(), meeting.getResult()),
				userRepository.getReferenceById(sessionService.getSessionUser().getId())
		);
	}

	private static PreAction confirmWithComment(@NonNull String actionText) {
		return ActionsExt.confirmWithCustomWidget(actionText + "?", "meetingResultFormPopup", "Approve and Save", "Cancel");
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

}

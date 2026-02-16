package org.demo.service.cxbox.inner;

import static org.demo.dto.cxbox.inner.MeetingDTO_.address;
import static org.demo.dto.cxbox.inner.MeetingDTO_.agenda;
import static org.demo.dto.cxbox.inner.MeetingDTO_.clientId;
import static org.demo.dto.cxbox.inner.MeetingDTO_.contactId;
import static org.demo.dto.cxbox.inner.MeetingDTO_.endDateTime;
import static org.demo.dto.cxbox.inner.MeetingDTO_.notes;
import static org.demo.dto.cxbox.inner.MeetingDTO_.region;
import static org.demo.dto.cxbox.inner.MeetingDTO_.responsibleId;
import static org.demo.dto.cxbox.inner.MeetingDTO_.result;
import static org.demo.dto.cxbox.inner.MeetingDTO_.startDateTime;

import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.val;
import org.cxbox.api.data.dto.MassDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.MessageType;
import org.cxbox.core.dto.multivalue.MultivalueFieldSingleValue;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.MassActionResultDTO;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.conf.cxbox.extension.multivaluePrimary.MultivalueExt;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.demo.entity.CalendarYearMeeting;
import org.demo.entity.Contact;
import org.demo.entity.Meeting;
import org.demo.entity.Meeting_;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.ClientRepository;
import org.demo.repository.ContactRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.MeetingsByDayRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.mail.MailSendingService;
import org.demo.service.statemodel.MeetingStatusModelActionProvider;
import org.jobrunr.scheduling.BackgroundJob;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class MeetingWriteService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private static final String MESSAGE_TEMPLATE = "Status: %s; \nMeeting Result: %s";

	private final MeetingRepository meetingRepository;

	private final ClientRepository clientRepository;

	private final ContactRepository contactRepository;

	private final UserRepository userRepository;

	private final MeetingStatusModelActionProvider statusModelActionProvider;

	private final EntityManager entityManager;

	private final MailSendingService mailSendingService;

	private final SessionService sessionService;

	@Getter(onMethod_ = @Override)
	private final Class<MeetingWriteMeta> meta = MeetingWriteMeta.class;

	private final MeetingsByDayRepository meetingsByDayRepository;

	@Override
	protected Specification<Meeting> getParentSpecification(BusinessComponent bc) {
		if (bc.getParentName().equals(CxboxRestController.calendarYearList.getName())) {
			LocalDate eventDate = Optional.ofNullable(bc.getParentIdAsLong()).map(meetingsByDayRepository::findById)
					.flatMap(m -> m)
					.map(CalendarYearMeeting::getEventDate)
					.map(LocalDateTime::toLocalDate).orElse(null);
			if (eventDate != null) {
				return (root, cq, cb) ->
						cb.and(
								cb.lessThanOrEqualTo(root.get(Meeting_.startDateTime), eventDate.atTime(LocalTime.MAX)),
								cb.greaterThanOrEqualTo(root.get(Meeting_.endDateTime), eventDate.atStartOfDay())
						)
						;
			} else {
				return (root, cq, cb) -> cb.disjunction();
			}
		}

		if (Objects.equals(bc.getParentName(), CxboxRestController.meetingStats.getName())) {
			return switch (bc.getParentId()) {
				case "2" -> createStatusSpecification(bc, MeetingStatus.NOT_STARTED);
				case "3" -> createStatusSpecification(bc, MeetingStatus.IN_COMPLETION);
				case "4" -> createStatusSpecification(bc, MeetingStatus.IN_PROGRESS);
				case "5" -> createStatusSpecification(bc, MeetingStatus.COMPLETED);
				case "6" -> createStatusSpecification(bc, MeetingStatus.CANCELLED);
				default -> (root, cq, cb) -> cb.and();
			};
		}
		return (root, cq, cb) -> cb.and();
	}

	private Specification<Meeting> createStatusSpecification(BusinessComponent bc, MeetingStatus status) {
		return (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(root.get(Meeting_.status), status)
		);
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
		setMappedIfChanged(
				data, responsibleId, entity::setResponsible,
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
		setMappedIfChanged(
				data, contactId, entity::setContact,
				id -> id != null ? contactRepository.getReferenceById(id) : null
		);
		meetingRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<MeetingDTO> onCancel(BusinessComponent bc) {
		return new ActionResultDTO<MeetingDTO>().setAction(PostAction.drillDown(
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
				.action(act -> act
						.action("save-with-validation", "Save")
						.scope(ActionScope.RECORD)
						.invoker((bc, dto) -> {
							MeetingStartAndEndDateValidator.validateStartAndEndDate(bc, dto);
							return new ActionResultDTO<>(dto);
						})
				)
				.withIcon(ActionIcon.MENU, false)
				.action(act -> act
						.scope(ActionScope.RECORD)
						.withAutoSaveBefore()
						.action("saveAndContinue", "Save")
						.withPreAction(PreAction.confirmWithWidget(
								"meetingResultFormPopup", cfw -> cfw
										.title("Approvale?")
										.yesText("Approve and Save")
										.noText("Cancel")
						))
						.invoker((bc, dto) -> {
							MeetingStartAndEndDateValidator.validateStartAndEndDate(bc, dto);
							return new ActionResultDTO<MeetingDTO>().setAction(
									PostAction.drillDown(
											DrillDownType.INNER,
											"/screen/meeting/view/meetingview/" + CxboxRestController.meeting + "/" + bc.getId()
									));
						})
				)
				.cancelCreate(ccr -> ccr.text("Cancel").available(bc -> true))
				.action(act -> act
						.scope(ActionScope.MASS)
						.action("massEdit", "Mass Edit")
						.withPreAction(PreAction.confirmWithWidget("meetingFormPopup", cfw -> cfw))
						.massInvoker((bc, data, ids) -> {
							var massResult = ids.stream()
									.map(id -> {
										try {
											Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(id));
											meeting.setAgenda(data.getAgenda());
											meeting.setRegion(data.getRegion());
											return MassDTO.success(id);
										} catch (Exception e) {
											return MassDTO.fail(id, "cannot update agenda");
										}
									})
									.collect(Collectors.toSet());
							return new MassActionResultDTO<MeetingDTO>(massResult)
									.setAction(PostAction.showMessage(MessageType.INFO, "The email mass operation was completed!"));
						})
				)
				.action(act -> act
						.scope(ActionScope.MASS)
						.action("massSendEmail", "Mass Send Email")
						.massInvoker((bc, data, ids) -> {
							var massResult = ids.stream()
									.map(id -> {
										try {
											Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(id));
											if (meeting.getStatus().equals(MeetingStatus.CANCELLED)) {
												return MassDTO.fail(id, "Meeting is cancelled. Email cannot be sent.");
											}
											getSend(meeting, true);
											return MassDTO.success(id);
										} catch (Exception e) {
											return MassDTO.fail(id, "cannot send meeting mail");
										}
									})
									.collect(Collectors.toSet());
							return new MassActionResultDTO<MeetingDTO>(massResult)
									.setAction(PostAction.showMessage(MessageType.INFO, "The email mass operation was completed!"));
						})
				)
				.action(act -> act
						.action("sendEmail", "Send Email")
						.invoker((bc, data) -> {
							Meeting meeting = meetingRepository.getReferenceById(Long.parseLong(bc.getId()));
							getSend(meeting, false);
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
				.action(act -> act
						.scope(ActionScope.BC)
						.withPreAction(PreAction.confirm(cf -> cf.text("Export to Excel?")))
						.action("customExportToExcel", "Export to excel")
						.invoker((bc, data) -> new ActionResultDTO<MeetingDTO>().setAction(PostAction.exportToExcel()))
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

}

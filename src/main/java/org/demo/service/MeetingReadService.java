package org.demo.service;

import com.google.common.collect.ImmutableMap;
import org.demo.conf.cxbox.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDTO;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.MeetingRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.dto.rowmeta.PreActionType;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.util.session.SessionService;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingReadService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	@Autowired
	private MeetingRepository meetingRepository;

	@Autowired
	private SessionService sessionService;

	public MeetingReadService() {
		super(MeetingDTO.class, Meeting.class, null, MeetingReadMeta.class);
	}

	@Override
	protected CreateResult<MeetingDTO> doCreateEntity(Meeting entity, BusinessComponent bc) {
		entity.setResponsible(sessionService.getSessionUser());
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
				.addGroup(
						"actions",
						"Actions",
						0,
						addEditAction(getStatusModelActions(Actions.builder())).build()
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

	private ActionsBuilder<MeetingDTO> getStatusModelActions(ActionsBuilder<MeetingDTO> builder) {
		Arrays.stream(MeetingStatus.values()).sequential()
				.forEach(status -> builder.newAction().action(status.getValue(), status.getButton())
						.invoker((bc, dto) -> {
							Meeting meeting = meetingRepository.getById(Long.parseLong(bc.getId()));
							meeting.getStatus().transition(status, meeting);
							if (meeting.getStatus().equals(MeetingStatus.COMPLETED)) {
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
								.customParameters(ImmutableMap.of("okText", status.getButton(), "cancelText", "Back to meeting list"))
								.build())
						.scope(ActionScope.RECORD)
						.add());
		return builder;
	}


	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}

package org.demo.service.action;

import com.google.common.collect.ImmutableMap;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.dto.rowmeta.PreActionType;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDTO;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.demo.repository.MeetingRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeetingStatusModelActionProvider {

	private final MeetingRepository meetingRepository;

	public ActionsBuilder<MeetingDTO> getMeetingActions() {
		ActionsBuilder<MeetingDTO> builder = Actions.builder();
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

}

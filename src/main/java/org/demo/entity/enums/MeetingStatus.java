package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Collections;
import org.demo.entity.Meeting;
import java.util.Arrays;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum MeetingStatus {
	COMPLETED("Completed", "Finish") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Collections.singletonList(IN_PROGRESS);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	IN_PROGRESS("In progress", "Start Meeting") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(COMPLETED, CANCELLED);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	NOT_STARTED("Not started", "") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(CANCELLED, IN_PROGRESS);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	CANCELLED("Cancelled", "Cancel Meeting") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Collections.singletonList(IN_PROGRESS);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	};

	@JsonValue
	private final String value;

	private final String button;

	public abstract List<MeetingStatus> available(@NonNull Meeting meeting);

	public abstract void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting);
}

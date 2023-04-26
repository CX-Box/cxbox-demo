package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import org.demo.entity.Meeting;
import java.util.Arrays;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum MeetingStatus {
	Completed("Completed", "Finish") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(InProgress);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	InProgress("In progress", "Start Meeting") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(Completed, Cancelled);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	NotStarted("Not started", "") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(Cancelled, InProgress);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	Cancelled("Cancelled", "Cancel Meeting") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(InProgress);
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

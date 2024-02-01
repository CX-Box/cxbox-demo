package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import org.demo.entity.Meeting;

@Getter
@AllArgsConstructor
public enum MeetingStatus {
	IN_COMPLETION("Рассмотрение", "Рассмотрение") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Collections.singletonList(COMPLETED);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},

	COMPLETED("Завершена", "Завершить") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Collections.singletonList(IN_PROGRESS);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},

	IN_PROGRESS("Ожидание", "Ожидание") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(IN_COMPLETION, CANCELLED);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	NOT_STARTED("Не начата", "") {
		@Override
		public List<MeetingStatus> available(@NonNull Meeting meeting) {
			return Arrays.asList(CANCELLED, IN_PROGRESS);
		}

		@Override
		public void transition(@NonNull MeetingStatus meetingStatus, @NonNull Meeting meeting) {
			meeting.setStatus(meetingStatus);
		}
	},
	CANCELLED("Отменена", "Отменить") {
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

	public static MeetingStatus getByValue(@NonNull String value) {
		return Arrays.stream(MeetingStatus.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}
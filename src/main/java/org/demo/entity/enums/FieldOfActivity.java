package org.demo.entity.enums;

import java.util.Arrays;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@RequiredArgsConstructor
public enum FieldOfActivity {
	IT("IT"),
	MEDIA("Media"),
	FINANCE("Finance"),
	MEDICINE("Medicine"),
	MANUFACTURING("Manufacturing"),
	EDUCATION("Education");

	@JsonValue
	private final String value;

	public static FieldOfActivity getByValue(@NonNull String value) {
		return Arrays.stream(FieldOfActivity.values())
				.filter(en -> en.getValue().equals(value))
				.findFirst()
				.orElse(null);
	}
}

package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ProcessEnum {
	HIGH("High"),
	MIDDLE("Middle"),
	LOW("Low");

	@JsonValue
	private final String value;

	public static ProcessEnum getByValue(@NonNull String value) {
		return Arrays.stream(ProcessEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}

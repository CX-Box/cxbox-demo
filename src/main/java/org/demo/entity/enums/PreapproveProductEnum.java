package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum PreapproveProductEnum {
	PreApprove("Pre-Approve"),
	TopUp("Top-Up"),
	Other("Иное");

	@JsonValue
	private final String value;

	public static PreapproveProductEnum getByValue(@NonNull String value) {
		return Arrays.stream(PreapproveProductEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}

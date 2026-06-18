package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter
@AllArgsConstructor
public enum ClientStatus {

	NEW("1", "New", "#779FE9", "team"),
	INACTIVE("2", "Inactive", "#5F90EA", "calendar"),
	IN_PROGRESS("3", "In progress", "#4D83E7", "pie-chart");

	private final String id;

	@JsonValue
	private final String value;

	private final String color;

	private final String icon;

	public String getDescription() {
		return value + ". Press to filter List below";
	}

	public static ClientStatus getById(String id) {
		return Arrays.stream(values())
				.filter(status -> status.id.equals(id))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException(
						"Unknown client status id: " + id
				));
	}

}
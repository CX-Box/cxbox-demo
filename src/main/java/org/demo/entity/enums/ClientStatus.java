package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ClientStatus {
	NEW("New"),
	INACTIVE("Inactive"),
	IN_PROGRESS("In progress");

	@JsonValue
	private final String value;

	public static final Map<ClientStatus, String> colorsPie = Map.of(
			NEW, "#779FE9",
			INACTIVE, "#5F90EA",
			IN_PROGRESS, "#4D83E7"
	);
	public static final Map<ClientStatus, String> iconPie = Map.of(
			NEW, "team",
			INACTIVE, "calendar",
			IN_PROGRESS, "pie-chart"
	);
}

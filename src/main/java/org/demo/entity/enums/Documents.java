package org.demo.entity.enums;

import static org.demo.entity.enums.Icons.CONTACTS_ICON;
import static org.demo.entity.enums.Icons.FILE_PROTECT_ICON;
import static org.demo.entity.enums.Icons.PAPER_CLIP_ICON;
import static org.demo.entity.enums.Icons.SECURITY_SCAN_ICON;
import static org.demo.entity.enums.Icons.TOOL_ICON;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import org.cxbox.api.data.dto.rowmeta.Icon;

@Getter
@AllArgsConstructor
public enum Documents {

	REFERENCE("Reference", PAPER_CLIP_ICON),
	POLICY("Policy", FILE_PROTECT_ICON),
	TECHNICAL("Technical", TOOL_ICON),
	LEGAL("Legal", CONTACTS_ICON),
	COMPLIANCE("Compliance", SECURITY_SCAN_ICON);

	@JsonValue
	private final String value;

	private final Icon icon;

	public static Documents getByValue(@NonNull String value) {
		return Arrays.stream(Documents.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static Map<Documents, Icon> iconMap() {
		return Arrays.stream(Documents.values()).filter(e -> e.icon != null).collect(Collectors.toMap(e -> e, e -> e.icon));
	}

}

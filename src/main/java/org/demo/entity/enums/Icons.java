package org.demo.entity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.data.dto.rowmeta.Icon;


@RequiredArgsConstructor
@Getter
public enum Icons implements Icon {
	PAPER_CLIP_ICON("paper-clip #0cbfe9"),
	FILE_PROTECT_ICON("file-protect"),
	CONTACTS_ICON("contacts"),
	SECURITY_SCAN_ICON("security-scan"),
	TOOL_ICON("tool");

	private final String icon;

}


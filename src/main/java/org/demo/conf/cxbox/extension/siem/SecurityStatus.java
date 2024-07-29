package org.demo.conf.cxbox.extension.siem;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SecurityStatus {

	SUCCESS("SUCCESS"),
	ERROR("ERROR"),
	VIEW("VIEW"),
	CREATE("CREATE"),
	UPDATE("UPDATE"),
	DELETE("DELETE"),
	CLEAN("CLEAN"),
	INFECTED("INFECTED"),
	NOT_SCANNED("NOT_SCANNED"),
	EXPORT("EXPORT");

	private final String code;

}
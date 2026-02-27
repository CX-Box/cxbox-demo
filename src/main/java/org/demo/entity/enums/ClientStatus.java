package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.locale.LocalizedEnum;
import org.demo.conf.locale.LocalizedEnumUtil;

@Slf4j
@Getter
@AllArgsConstructor
public enum ClientStatus implements LocalizedEnum{
	NEW("New","Nouvelle"),
	INACTIVE("Inactive","Inactive"),
	IN_PROGRESS("In progress","En cours");

	@JsonValue
	private final String value;

	private final String valueFr;

	@JsonValue
	public String toValue() {
		return LocalizedEnumUtil.toValue(this);
	}

	@JsonCreator
	public static ClientStatus fromValue(String value) {
		return LocalizedEnumUtil
				.fromValue(ClientStatus.class, value)
				.orElse(null);
	}

}

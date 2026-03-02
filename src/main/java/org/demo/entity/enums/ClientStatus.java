package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.locale.LocaleEnum;

@Slf4j
@Getter
@AllArgsConstructor
public enum ClientStatus implements LocaleEnum<ClientStatus> {
	NEW("New", "Nouvelle"),
	INACTIVE("Inactive", "Inactive"),
	IN_PROGRESS("In progress", "En cours");

	@JsonValue
	private final String value;

	private final String valueFr;


}

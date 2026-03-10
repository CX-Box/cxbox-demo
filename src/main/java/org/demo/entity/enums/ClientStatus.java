package org.demo.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.demo.conf.cxbox.extension.locale.LocaleEnum;

@Getter
@AllArgsConstructor
public enum ClientStatus implements LocaleEnum<ClientStatus> {
	NEW("New", "Nouvelle"),
	INACTIVE("Inactive", "Inactive"),
	IN_PROGRESS("In progress", "En cours");

	private final String value;

	private final String valueFr;


}

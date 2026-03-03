package org.demo.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.demo.conf.cxbox.customization.locale.LocaleEnum;

@Getter
@AllArgsConstructor
public enum SaleStatus implements LocaleEnum<SaleStatus> {

	OPEN("Open", "Ouvrir"),
	CLOSED("Closed", "Fermée");

	private final String value;

	private final String valueFr;

}

package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.locale.LocalizedEnum;
import org.demo.conf.locale.LocalizedEnumUtil;

@Slf4j
@Getter
@AllArgsConstructor
public enum SaleStatus implements LocalizedEnum {

	OPEN("Open", "Ouvrir"),
	CLOSED("Closed", "Fermée");

	private final String value;

	private final String valueFr;

	@JsonValue
	public String toValue() {
		return LocalizedEnumUtil.toValue(this);
	}

	@JsonCreator
	public static SaleStatus fromValue(String value) {
		return LocalizedEnumUtil.fromValue(SaleStatus.class, value).orElse(null);
	}

}

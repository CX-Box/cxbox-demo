package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum ProofOfIncomeEnum {
	PD("Документ", "PD"),
	Automatically("Без документа", "Automatically"),
	PFR("Выписка ПФР", "PFR"),
	DIP("ЦП", "DIP");

	@JsonValue
	private final String value;

	@JsonValue
	private final String SiebelLIC;


	public static ProofOfIncomeEnum getByValue(@NonNull String value) {
		return Arrays.stream(ProofOfIncomeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}

package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum GBCLimitOperationTypeEnum {
	HACL1("Аннулирование лимита (просрочка по КК)"),
	ACL2("Аннулирование лимита (просрочка по иным кредитам)"),
	BCL1("Блокировка лимита (просрочка по КК)"),
	BCL2("Блокировка лимита (просрочка по иным кредитам)"),
	ISC1("Установка лимита при открытии ссуды"),
	LDB1("Уменьшение лимита по инициативе Банка"),
	LDC1("Уменьшение лимита по инициативе клиента"),
	LIB1("Увеличение лимита по инициативе Банка с акцептом Клиента"),
	LIB2("Увеличение лимита по инициативе Банка без акцепта Клиента"),
	LIC1("Увеличение лимита по инициативе клиента"),
	LIC2("Увеличение лимита по инициативе клиента OVR Payroll"),
	LRC2("Восстановление предыдущего значения лимита"),
	LSTL("Значение лимита до изменения"),
	RCL0("Разблокировка кредитного лимита"),
	TEST("Тестовая операция");

	@JsonValue
	private final String value;

	public static GBCLimitOperationTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(GBCLimitOperationTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}

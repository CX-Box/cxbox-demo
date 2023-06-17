package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Objects;
import javax.annotation.Nullable;
import lombok.Getter;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@RequiredArgsConstructor
public enum MacroProduct {
	CreditCard("Кредитная карта", 50),
	Overdraft("Овердрафт", 50),
	NPK("Кредит наличными", 51),
	NCC("Новая кредитная карта", 52),
	DepositSMS("Вклад", 53),
	OtherProducts("Другие продукты", 53),
	Credit("Кредитные продукты", 53),
	Accounts("Счета/карты/ПБУ",53),
	Refinance("Рефинансирование", 55),
	CLC("УКЛ", 56),
	MFO("МФО", 80),
	AUTO("Автокредит", 100),
	RefinanceIZK("Рефинансирование ИЖК", 100),
	Undefined("Не определен", 101),
	Deposit("Депозит", 104),
	Overdraft1RUR("Овердрафт 1 рубль", 103),
	CurrentAccount("Текущий счет", 201),
	CardEverythingAllowed("Карта МожноВсе", 202),
	BankDeposit("Банковский вклад", 203);


	@JsonValue
	private final String value;

	private final int order;

	@Nullable
	public static MacroProduct getByValue(@NonNull String value) {
		return Arrays.stream(MacroProduct.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}
}

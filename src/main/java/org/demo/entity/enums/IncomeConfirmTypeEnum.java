package org.demo.entity.enums;

import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import com.fasterxml.jackson.annotation.JsonValue;

@Getter
@AllArgsConstructor
public enum IncomeConfirmTypeEnum {
	TWO_NDFL("Справка 2НДФЛ", "2NDFL"),
	DifferentDoc("Иной подтверждающий документ", "Different doc"),
	THREE_NDFL("Налоговая декларация", "3NDFL"),
	Bank("Справка по форме Банка", "Bank"),
	RosBank("Выписка по ЗП в РОСБАНКЕ", "RosBank"),
	RosBankLBS("Выписка по ЛБС в РОСБАНКЕ", "RosBankLBS"),
	Registry("Реестр стажа/дохода сотрудника", "Registry"),
	AnotherBank("Выписка по ЗП в другом банке", "Another Bank"),
	AnotherBankLBS("Выписка по ЛБС в другом банке", "Another BankLBS"),
	Income("Справ. о доходах по фор. Предп", "Income"),
	Pension("Справка о размере пенсии", "Pension"),
	BankNoStamp("Справка по форме Работодателя", "Bank No Stamp"),
	TWO_NDFLNoStamp("Справка 2НДФЛ без печати", "2NDFL No Stamp"),
	BankNotUsed("Справка о доходах по ф. Банка", "Bank Not Used");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static IncomeConfirmTypeEnum getByValue(@NonNull String value) {
		return Arrays.stream(IncomeConfirmTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static IncomeConfirmTypeEnum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(IncomeConfirmTypeEnum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}

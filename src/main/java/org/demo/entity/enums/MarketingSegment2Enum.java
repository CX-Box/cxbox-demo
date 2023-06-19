package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum MarketingSegment2Enum {
	NLT("(NLT) Маркетинговый сегмент 2 по умолчанию", "222"),
	ZERO("0", "0"),
	MassMarket("Mass Market", "Mass Market"),
	PotentialPremium("Potential Premium", "Potential Premium"),
	StablePremium("Stable Premium", "Stable Premium"),
	TopPremium("Top Premium", "Top Premium"),
	Mass("Mass", "Mass"),
	VIP1("VIP 1", "VIP 1"),
	VIP2("VIP 2", "VIP 2"),
	Premium("Premium", "Premium"),
	PremiumEarly("Premium early", "Premium early"),
	PremiumOnline("Premium Online", "Premium Online"),
	PremiumOnlineEarly("Premium Online early", "Premium Online early"),
	TOPPremiumEarly("TOP Premium  early", "TOP Premium  early");

	@JsonValue
	private final String value;

	private final String siebelLIC;

	public static MarketingSegment2Enum getByValue(@NonNull String value) {
		return Arrays.stream(MarketingSegment2Enum.values())
				.filter(enm -> Objects.equals(enm.getValue(), value))
				.findFirst()
				.orElse(null);
	}

	public static MarketingSegment2Enum getBySiebelLIC(@NonNull String value) {
		return Arrays.stream(MarketingSegment2Enum.values())
				.filter(enm -> Objects.equals(enm.getSiebelLIC(), value))
				.findFirst()
				.orElse(null);
	}
}

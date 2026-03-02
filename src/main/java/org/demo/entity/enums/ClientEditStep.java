package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.locale.LocalizedEnum;
import org.demo.conf.locale.LocalizedEnumUtil;
import org.demo.entity.Client;
import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Slf4j
@Getter
@AllArgsConstructor
public enum ClientEditStep implements LocalizedEnum {

	FILL_GENERAL_INFORMATION(
			"Fill general information",
			"Remplir les informations générales",
			"screen/client/view/clienteditgeneral/"
	),


	CREATE_CLIENT_CONTACT(
			"Add client contact",
			"Ajouter les coordonnées du client",
			"screen/client/view/clienteditcontacts/"
	),

	REVIEW_CLIENT_CARD(
			"Review client card",
			"Consulter la fiche client",
			"screen/client/view/clienteditoverview/"
	);

	@JsonValue
	private final String value;

	private final String valueFr;

	private final String editView;


	@JsonValue
	public String toValue() {
		return LocalizedEnumUtil.toValue(this);
	}

	@JsonCreator
	public static ClientEditStep fromValue(String value) {
		return LocalizedEnumUtil
				.fromValue(ClientEditStep.class, value)
				.orElse(null);
	}

	@NonNull
	public static Optional<ClientEditStep> getNextEditStep(Client client) {
		return Arrays.stream(ClientEditStep.values())
				.filter(v -> v.ordinal() > client.getEditStep().ordinal())
				.findFirst();
	}

	@NonNull
	public static Optional<ClientEditStep> getPreviousEditStep(Client client) {
		return Arrays.stream(ClientEditStep.values())
				.filter(v -> v.ordinal() < client.getEditStep().ordinal())
				.min((v1, v2) -> Integer.compare(v2.ordinal(), v1.ordinal()));
	}
}

package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.demo.entity.Client;
import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import org.springframework.context.i18n.LocaleContextHolder;

@Slf4j
@Getter
@AllArgsConstructor
public enum ClientEditStep {

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
		if (Locale.FRENCH.getLanguage().equals(LocaleContextHolder.getLocale().getLanguage())) {
			return valueFr;
		}
		return value;
	}

	@JsonCreator
	public static ClientEditStep fromValue(String value) {
		return Stream.of(values())
				.filter(s -> s.toValue().equalsIgnoreCase(value))
				.findFirst()
				.orElseGet(() -> {
					log.warn("Unknown SaleStatus: {}", value);
					return null;
				});
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

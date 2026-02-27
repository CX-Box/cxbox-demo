package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.demo.entity.Client;
import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;
import org.springframework.context.i18n.LocaleContextHolder;

@Getter
@AllArgsConstructor
public enum ClientEditStep {

	FILL_GENERAL_INFORMATION(
			"Fill general information",
			"screen/client/view/clienteditgeneral/",
			Locale.ENGLISH.getLanguage()
	),
	FILL_GENERAL_INFORMATION_FR(
			"Remplir les informations générales",
			"screen/client/view/clienteditgeneral/",
			Locale.FRENCH.getLanguage()
	),

	CREATE_CLIENT_CONTACT(
			"Add client contact",
			"screen/client/view/clienteditcontacts/",
			Locale.ENGLISH.getLanguage()
	),
	CREATE_CLIENT_CONTACT_FR(
			"Ajouter les coordonnées du client",
			"screen/client/view/clienteditcontacts/",
			Locale.FRENCH.getLanguage()
	),

	REVIEW_CLIENT_CARD(
			"Review client card",
			"screen/client/view/clienteditoverview/",
			Locale.ENGLISH.getLanguage()
	),
	REVIEW_CLIENT_CARD_FR(
			"Consulter la fiche client",
			"screen/client/view/clienteditoverview/",
			Locale.FRENCH.getLanguage()
	);

	@JsonValue
	private final String value;

	private final String editView;

	private final String locale;

	public static ClientEditStep getValueWithLocale(ClientEditStep value) {
		return Arrays.stream(values())
				.filter(e ->
						e.name().equals(value.name())
								&& e.locale.equals(LocaleContextHolder.getLocale().getLanguage())
				)
				.findFirst()
				.orElse(value);
	}
	public static ClientEditStep[] valuesWithLocale() {
		return Arrays.stream(values())
				.filter(e ->
				e.locale.equals(LocaleContextHolder.getLocale().getLanguage())
				)
				.toArray(ClientEditStep[]::new);
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

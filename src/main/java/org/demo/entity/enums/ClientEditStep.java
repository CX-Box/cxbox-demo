package org.demo.entity.enums;

import org.demo.conf.cxbox.customization.locale.LocaleEnum;
import org.demo.entity.Client;
import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum ClientEditStep  implements LocaleEnum<ClientEditStep> {

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


	private final String value;

	private final String valueFr;

	private final String editView;

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

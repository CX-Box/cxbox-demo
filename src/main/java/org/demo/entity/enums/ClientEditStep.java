package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import org.demo.entity.Client;
import java.util.Arrays;
import java.util.Optional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NonNull;

@Getter
@AllArgsConstructor
public enum ClientEditStep {
	FILL_GENERAL_INFORMATION("Fill general information", "screen/client/view/clienteditgeneral/"),
	CREATE_CLIENT_CONTACT("Add client contact", "screen/client/view/clienteditcontacts/"),
	REVIEW_CLIENT_CARD("Review client card", "screen/client/view/clienteditoverview/");

	@JsonValue
	private final String value;

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

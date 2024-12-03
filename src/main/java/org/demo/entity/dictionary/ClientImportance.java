package org.demo.entity.dictionary;

import java.util.Map;
import org.cxbox.dictionary.Dictionary;

public record ClientImportance(String key) implements Dictionary {

	public static final ClientImportance HIGH = new ClientImportance("HIGH");

	public static final ClientImportance MIDDLE = new ClientImportance("MIDDLE");

	public static final ClientImportance LOW = new ClientImportance("LOW");

	public static final Map<ClientImportance, String> colors = Map.of(
			HIGH, "#EC3F3F",
			MIDDLE, "#FCA546",
			LOW, "#008C3E"
	);

}

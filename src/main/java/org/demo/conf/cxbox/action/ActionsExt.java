package org.demo.conf.cxbox.action;

import java.util.HashMap;
import java.util.Map;
import lombok.experimental.UtilityClass;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.jetbrains.annotations.Nullable;

@UtilityClass
public class ActionsExt {

	public static PreAction confirmWithCustomWidget(@Nullable String message, @Nullable String widget, @Nullable String yesButton, @Nullable String noButton) {
		Map<String, String> customParameters = new HashMap<>();
		customParameters.put("subtype", "confirmWithCustomWidget");
		if (widget != null) {
			customParameters.put("widget", widget);
		}
		if (yesButton != null) {
			customParameters.put("yesText", yesButton);
		}
		if (noButton != null) {
			customParameters.put("noText", noButton);
		}
		return PreAction.custom(message, customParameters);
	}

}
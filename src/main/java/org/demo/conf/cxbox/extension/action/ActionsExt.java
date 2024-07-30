package org.demo.conf.cxbox.extension.action;

import java.util.HashMap;
import java.util.Map;
import lombok.experimental.UtilityClass;
import org.cxbox.core.dto.rowmeta.PreAction;

@UtilityClass
public class ActionsExt {

	public static PreAction confirmWithCustomWidget(String message, String widget, String yesButton, String noButton) {
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
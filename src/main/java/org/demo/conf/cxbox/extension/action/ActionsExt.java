package org.demo.conf.cxbox.extension.action;

import java.util.HashMap;
import java.util.Map;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.dto.rowmeta.PreAction.PreActionBuilder;
import org.cxbox.core.dto.rowmeta.PreActionType;

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

	public static PreAction confirm(String message, String title, String yesButton, String noButton) {
		PreActionBuilder preActionBuilder = PreAction.builder()
				.preActionType(PreActionType.CONFIRMATION);
		Map<String, String> customParameters = new HashMap<>();
		if (message != null) {
			preActionBuilder.message(message);
		}
		if (title != null) {
			customParameters.put("messageContent", title);
		}
		if (yesButton != null) {
			customParameters.put("okText", yesButton);
		}
		if (noButton != null) {
			customParameters.put("cancelText", noButton);
		}
		return preActionBuilder
				.customParameters(customParameters)
				.build();
	}

}
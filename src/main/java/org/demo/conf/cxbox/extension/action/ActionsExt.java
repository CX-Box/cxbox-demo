package org.demo.conf.cxbox.extension.action;

import lombok.experimental.UtilityClass;
import org.cxbox.core.dto.rowmeta.PreAction;

@UtilityClass
public class ActionsExt {

	/**
	 * Please just inline this method with right-click -> refactor -> inline in IntelliJ IDEA
	 * to move your whole code base to new PreAction.confirmWithWidgetBuilder from cxbox core
	 */
	@Deprecated(since = "4.0.0-M16-SNAPSHOT", forRemoval = true)
	public static PreAction confirmWithCustomWidget(String message, String widget, String yesButton, String noButton) {
		//WARN!
		// if you want to hide the title - use cf.withoutTitle().
		// DO NOT use non-null black String in title for this purpose!
		// E.g., title(String) is supposed to be null or non-blank
		return PreAction.confirmWithWidget(widget, cfw -> cfw.title(message).yesText(yesButton).noText(noButton));
	}

	/**
	 * Please just inline this method with right-click -> refactor -> inline in IntelliJ IDEA
	 * to move your whole code base to new PreAction.confirmBuilder from cxbox core
	 */
	@Deprecated(since = "4.0.0-M16-SNAPSHOT", forRemoval = true)
	public static PreAction confirm(String message, String title, String yesButton, String noButton) {
		//WARN!
		// if you want to hide the title/text - use cf.withoutTitle()/cf.withoutText().
		// DO NOT use no-null black String in title/text for this purpose!
		// E.g., title(String)/text(String) are supposed to be null or non-blank
		return PreAction.confirm(cf -> cf.text(message).title(title).yesText(yesButton).noText(noButton));
	}

}

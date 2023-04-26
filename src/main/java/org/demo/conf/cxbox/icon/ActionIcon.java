package org.demo.conf.cxbox.icon;

import org.cxbox.core.service.action.ActionIconSpecifier;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ActionIcon implements ActionIconSpecifier {
	MENU("menu");

	String actionIconCode;
}

package org.demo.entity.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum TargetNodeType {
	MAIN("main");

	private final String value;
}

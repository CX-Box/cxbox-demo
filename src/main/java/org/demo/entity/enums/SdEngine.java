package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SdEngine {
	SD3("sd3"),
	SD3TURBO("sd3-turbo"),
	FAST_GREEN("FAST_GREEN"),
	STABLE_DIFFUSION_V_16("stable-diffusion-v1-6"),
	STABLE_DIFFUSION_XL_1024_V_10("stable-diffusion-xl-1024-v1-0");

	@JsonValue
	private final String value;
}
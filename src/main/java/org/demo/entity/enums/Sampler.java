package org.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Sampler {

	DDIM("DDIM"),
	DDPM("DDPM"),
	K_DPMPP_2M("K_DPMPP_2M"),
	K_DPMPP_2S_ANCESTRAL("K_DPMPP_2S_ANCESTRAL"),
	K_DPM_2("K_DPM_2"),
	K_DPM_2_ANCESTRAL("K_DPM_2_ANCESTRAL"),
	K_EULER("K_EULER"),
	K_EULER_ANCESTRAL("K_EULER_ANCESTRAL"),
	K_HEUN("K_HEUN"),
	K_LMS("K_LMS");

	@JsonValue
	private final String value;
}
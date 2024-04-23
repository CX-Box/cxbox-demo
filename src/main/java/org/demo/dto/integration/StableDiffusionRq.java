package org.demo.dto.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.demo.entity.enums.ClipGuidancePreset;
import org.demo.entity.enums.Sampler;
import org.demo.entity.enums.SdEngine;

@SuperBuilder(toBuilder = true)
public class StableDiffusionRq extends AirMessageRq {

/*	@JsonProperty("info")
	public Info info;*/

	@NoArgsConstructor
	@Getter
	@Setter
	@SuperBuilder(toBuilder = true)
	public static class Info {

		@JsonProperty("format_image")
		private String formatImage = "1024x1024";

		private String style;

		@JsonProperty("num_outputs")
		private int numOutputs = 5;

		@JsonProperty("clip_guidance_preset")
		private ClipGuidancePreset clipGuidancePreset = ClipGuidancePreset.NO;

		private SdEngine engine = SdEngine.SD3;

		private Sampler sampler = Sampler.K_DPMPP_2M;

		private int steps = 30;

		@JsonProperty("cfg_scale")
		private int cfgScale = 7;

		@JsonProperty("translate_prompt")
		private boolean translatePrompt = true;

	}

}

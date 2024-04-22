package org.demo.dto.integration;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder(toBuilder = true)
@NoArgsConstructor
public class AirMessageRs {

	private String uid;

	private String content;

	private String file;

	@JsonProperty("from_model")
	private boolean fromModel;

	@JsonProperty("created_at")
	private String createdAt;

	@JsonProperty("elapsed_time")
	private String elapsedTime;

	@JsonProperty("is_favourite")
	private boolean isFavourite;

	@JsonProperty("is_sent")
	private boolean isSent;

	private Object info;

}

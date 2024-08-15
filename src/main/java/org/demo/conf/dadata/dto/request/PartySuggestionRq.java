package org.demo.conf.dadata.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PartySuggestionRq {

	private String query;

	private Integer count;

	private String type;

	@JsonProperty("status")
	private List<String> allowedStatuses;

	@JsonProperty("okved")
	private List<String> okvedFilter;

	@JsonProperty("locations")
	private List<Object> locationFilter;

	@JsonProperty("locations_boost")
	private List<Object> locationsBoost;

}

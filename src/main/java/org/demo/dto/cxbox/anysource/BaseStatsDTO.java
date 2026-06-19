package org.demo.dto.cxbox.anysource;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@Accessors(chain = true)
public class BaseStatsDTO extends DataResponseDTO {

	private String title;
	private Object value;
	private String color;
	private String icon;
	private String description;

}
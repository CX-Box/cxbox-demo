package org.demo.dto.cxbox.anysource;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalesProgressStatsDTO extends DataResponseDTO {

	private String salesSum;

	private String salesDescription;

	private String salesPercent;


}

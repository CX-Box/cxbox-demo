package org.demo.dto.cxbox;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class SaleClientDTO extends DataResponseDTO {

	private String relationSaleDTOId;

}

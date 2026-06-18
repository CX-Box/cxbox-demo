package org.demo.dto.cxbox.anysource;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder(toBuilder = true)
public class ClientSaleLineDTO extends DataResponseDTO {

	private Integer month;

	private Integer year;

	private String dateSales;

	private String fullName;

	private String clientId;

	private Long sum;

	private Long count;

	private String color;

	public static String monthYearString(Integer month, Integer year) {
		return month + "/" + year;
	}

	public String getDateSales() {
		return monthYearString(month, year);
	}

}

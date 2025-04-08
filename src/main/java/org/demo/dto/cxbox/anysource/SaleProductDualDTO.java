package org.demo.dto.cxbox.anysource;

import java.time.Month;
import java.time.format.TextStyle;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.SaleStatus;
import org.springframework.context.i18n.LocaleContextHolder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder(toBuilder = true)
public class SaleProductDualDTO extends DataResponseDTO {

	private Integer month;

	private Integer year;

	private String dateCreatedSales;

	private Product productType;

	private Long sum;

	private SaleStatus saleStatus;

	private Long count;

	private String color;

	public static String monthYearString2(Integer month, Integer year) {
		return month + "/" + year;
	}

	public static String monthYearString(Integer month, Integer year) {
		return (month != null && year != null) ?
				Month.of(month).getDisplayName(TextStyle.FULL, LocaleContextHolder.getLocale()) + "/" + year : "";
	}

	public String getDateCreatedSales() {
		return monthYearString2(month, year);
	}

}

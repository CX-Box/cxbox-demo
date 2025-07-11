package org.demo.service.cxbox.anysource.saledualstats;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.SaleProductDualDTO;
import org.demo.dto.cxbox.anysource.SaleProductDualDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.dto.cxbox.inner.SaleDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDualMeta extends AnySourceFieldMetaBuilder<SaleProductDualDTO> {


	private final PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public static LocalDate firstDay(Integer month, Integer year) {
		return (month == null || year == null) ? null : LocalDate.of(year, month, 1);
	}

	public static LocalDate lastDay(Integer month, Integer year) {
		return (month == null || year == null) ? null
				: LocalDate.of(year, month, 1).withDayOfMonth(LocalDate.of(year, month, 1).lengthOfMonth());
	}

	public void buildRowDependentMeta(RowDependentFieldsMeta<SaleProductDualDTO> fields, BcDescription bc,
			String id, String parentId) {
		//do nothing
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<SaleProductDualDTO> fields, BcDescription bcDescription,
			String parentId) {
		var month = fields.getCurrentValue(SaleProductDualDTO_.month).orElse(null);
		var year = fields.getCurrentValue(SaleProductDualDTO_.year).orElse(null);
		var dateFrom = firstDay(month, year);
		var dateTo = lastDay(month, year);
		var activity = parentDtoFirstLevelCache.getParentField(
				DashboardFilterDTO_.fieldOfActivity,
				platformRequest.getBc()
		);

		fields.setDrilldownWithFilter(
				SaleProductDualDTO_.dateCreatedSales,
				DrillDownType.INNER,
				"screen/sale/view/salelist",
				fc -> fc
						.add(CxboxRestController.sale, SaleDTO.class, fb -> fb
								.dateFromTo(SaleDTO_.createdDate, dateFrom, dateTo)
								.dictionary(SaleDTO_.product, fields.getCurrentValue(SaleProductDualDTO_.productType).orElse(null))
								.dictionaryEnum(SaleDTO_.status, fields.getCurrentValue(SaleProductDualDTO_.saleStatus).orElse(null))
								.multipleSelect(SaleDTO_.fieldOfActivity, activity)
						)
		);
	}


}

package org.demo.service.cxbox.anysource.sales2lines;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.DashboardSalesProductDualDTO;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductLines2DMeta extends AnySourceFieldMetaBuilder<DashboardSalesProductDualDTO> {

	@Autowired
	private PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	public void buildRowDependentMeta(RowDependentFieldsMeta<DashboardSalesProductDualDTO> fields, BcDescription bc,
			String id, String parentId) {

	}


	@Override
	public void buildIndependentMeta(FieldsMeta<DashboardSalesProductDualDTO> fields, BcDescription bcDescription,
			String parentId) {

	}


	private BusinessComponent getBc() {
		return this.platformRequest.getBc();
	}

}

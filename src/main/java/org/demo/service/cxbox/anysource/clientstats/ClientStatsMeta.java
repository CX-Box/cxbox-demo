package org.demo.service.cxbox.anysource.clientstats;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.demo.dto.cxbox.anysource.BaseStatsDTO_;
import org.demo.dto.cxbox.inner.ClientAbstractDTO_;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.ClientStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsMeta extends AnySourceFieldMetaBuilder<BaseStatsDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<BaseStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

		boolean isDashboard = bc.getName().equals(CxboxRestController.dashboardClientStats.getName());

		fields.setDrilldownWithFilter(
				BaseStatsDTO_.value,
				DrillDownType.INNER,
				"/screen/client/view/clientlist",
				fc -> fc.add(
						CxboxRestController.client, ClientReadDTO.class,
						fb -> {
							fb.dictionaryEnum(ClientAbstractDTO_.status, getStatusFilterValues(id));

							if (isDashboard) {
								var activity = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc());

								if (activity != null) {
									fb.multipleSelect(ClientReadDTO_.fieldOfActivity, activity);
								}
							}
						}
				)
		);
	}

	private ClientStatus getStatusFilterValues(@NonNull String id) {
		return ClientStatus.getById(id);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<BaseStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

}

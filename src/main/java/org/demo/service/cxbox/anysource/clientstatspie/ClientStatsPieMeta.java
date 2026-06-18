package org.demo.service.cxbox.anysource.clientstatspie;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.dto.cxbox.anysource.ClientStatsDTO_;
import org.demo.dto.cxbox.inner.ClientAbstractDTO_;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.ClientStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsPieMeta extends AnySourceFieldMetaBuilder<ClientStatsDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

		var activity = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc());

		fields.setDrilldownWithFilter(
				ClientStatsDTO_.value,
				DrillDownType.INNER,
				"screen/client/view/clientlist",
				fc -> fc
						.add(
								CxboxRestController.client, ClientReadDTO.class, fb -> fb
										.dictionaryEnum(ClientAbstractDTO_.status, getStatusFilterValues(id))
										.multipleSelect(ClientReadDTO_.fieldOfActivity, activity)
						)
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

	private ClientStatus getStatusFilterValues(@NonNull String id) {
		return ClientStatus.getById(id);
	}

}

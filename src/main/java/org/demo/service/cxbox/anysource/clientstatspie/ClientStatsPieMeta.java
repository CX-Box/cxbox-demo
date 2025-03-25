package org.demo.service.cxbox.anysource.clientstatspie;

import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.INACTIVE_CLIENTS_ID;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.IN_PROGRESS_CLIENTS;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.NEW_CLIENTS_ID;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.conf.cxbox.extension.drilldown.DrillDownExt;
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

	private final PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	private final DrillDownExt drillDownExt;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientStatsDTO> fields, BcDescription bc,
			String id, String parentId) {
		fields.setDrilldown(ClientStatsDTO_.value, DrillDownType.INNER, getDrillDown(id));
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

	private String getDrillDown(@NonNull String id) {
		var activity = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc());
		var filter = drillDownExt.filterBcByFields(
				CxboxRestController.client, ClientReadDTO.class, fb -> fb
						.dictionaryEnum(ClientAbstractDTO_.status, getStatusFilterValues(id))
						.multiValue(ClientReadDTO_.fieldOfActivity, activity)
		);
		return "screen/client/view/clientlist" + filter;
	}

	private BusinessComponent getBc() {
		return this.platformRequest.getBc();
	}

	private ClientStatus getStatusFilterValues(@NonNull String id) {
		return switch (id) {
			case NEW_CLIENTS_ID -> ClientStatus.NEW;
			case INACTIVE_CLIENTS_ID -> ClientStatus.INACTIVE;
			case IN_PROGRESS_CLIENTS -> ClientStatus.IN_PROGRESS;
			default -> throw new IllegalStateException("Unexpected value: " + id);
		};
	}

}

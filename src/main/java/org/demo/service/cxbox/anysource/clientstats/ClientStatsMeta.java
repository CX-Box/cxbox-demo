package org.demo.service.cxbox.anysource.clientstats;

import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.INACTIVE_CLIENTS_ID;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.IN_PROGRESS_CLIENTS;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.NEW_CLIENTS_ID;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.dto.cxbox.anysource.ClientStatsDTO_;
import org.demo.dto.cxbox.inner.ClientAbstractDTO_;
import org.demo.dto.cxbox.inner.ClientReadDTO;
import org.demo.entity.enums.ClientStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsMeta extends AnySourceFieldMetaBuilder<ClientStatsDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientStatsDTO> fields, BcDescription bc,
			String id, String parentId) {
		fields.setDrilldownWithFilter(
				ClientStatsDTO_.value,
				DrillDownType.INNER,
				"/screen/client/view/clientlist",
				fc -> fc
						.add(CxboxRestController.client, ClientReadDTO.class, fb -> fb
										.dictionaryEnum(ClientAbstractDTO_.status, getStatusFilterValues(id)))

		);
	}

	private ClientStatus getStatusFilterValues(@NonNull String id) {
		return switch (id) {
			case NEW_CLIENTS_ID -> ClientStatus.NEW;
			case INACTIVE_CLIENTS_ID -> ClientStatus.INACTIVE;
			case IN_PROGRESS_CLIENTS -> ClientStatus.IN_PROGRESS;
			default -> throw new IllegalStateException("Unexpected value: " + id);
		};
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientStatsDTO> fields, BcDescription bcDescription,
			String parentId) {
		//do nothing
	}

}

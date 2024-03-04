package org.demo.service.cxbox.anysource.clientstats;

import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDAO.INACTIVE_CLIENTS_ID;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDAO.IN_PROGRESS_CLIENTS;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDAO.NEW_CLIENTS_ID;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.dto.cxbox.anysource.ClientStatsDTO_;
import org.demo.dto.cxbox.inner.ClientAbstractDTO_;
import org.demo.entity.enums.ClientStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsMeta extends AnySourceFieldMetaBuilder<ClientStatsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

		fields.setDrilldown(
				ClientStatsDTO_.value,
				DrillDownType.INNER,
				"/screen/client/view/clientlist"
						+ "/" + CxboxRestController.client
						+ "?filters={\""
						+ CxboxRestController.client
						+ "\":\""
						+ ClientAbstractDTO_.status.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName()
						+ "=[\\\""
						+ getStatusFilterValues(id)
						+ "\\\"]"
						+ "\"}"
		);
	}

	private String getStatusFilterValues(@NonNull String id) {
		if (NEW_CLIENTS_ID.equals(id)) {
			return ClientStatus.NEW.getValue();
		} else if (INACTIVE_CLIENTS_ID.equals(id)) {
			return ClientStatus.INACTIVE.getValue();
		} else if (IN_PROGRESS_CLIENTS.equals(id)) {
			return ClientStatus.IN_PROGRESS.getValue();
		}
		throw new IllegalStateException("Unexpected value: " + id);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientStatsDTO> fields, BcDescription bcDescription,
			String parentId) {

	}

}

package org.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.NonNull;
import org.cxbox.api.data.ResultPage;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.AbstractCrudmaService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.MetaDTO;
import org.cxbox.core.service.rowmeta.RowMetaType;
import org.cxbox.core.service.rowmeta.RowResponseService;
import org.demo.controller.CxboxRestController;
import org.demo.dto.ClientAbstractDTO_;
import org.demo.dto.ClientStatsDTO;
import org.demo.dto.ClientStatsDTO_;
import org.demo.entity.enums.ClientStatus;
import org.demo.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ClientStatsService extends AbstractCrudmaService {

	private static final int ROWS_TOTAL = 3;

	public static final String NEW_CLIENTS_ID = "0";

	public static final String INACTIVE_CLIENTS_ID = "1";

	public static final String IN_PROGRESS_CLIENTS = "2";

	@Autowired
	private ClientRepository clientRepository;

	@Autowired
	RowResponseService rowMeta;

	@Override
	public ResultPage<ClientStatsDTO> getAll(BusinessComponent bc) {
		List<ClientStatsDTO> result = new ArrayList<>(ROWS_TOTAL);
		ClientStatsDTO newClients = new ClientStatsDTO()
				.setTitle("New Clients")
				.setValue(clientRepository.count(clientRepository.statusIn(List.of(ClientStatus.NEW))))
				.setColor("#779FE9")
				.setIcon("team") //same as in screen.json icon
				.setDescription("New Clients. Press to filter List below");
		newClients.setId(NEW_CLIENTS_ID);
		result.add(newClients);
		ClientStatsDTO inactiveClients = new ClientStatsDTO()
				.setTitle("Inactive Clients")
				.setValue(clientRepository.count(clientRepository.statusIn(List.of(ClientStatus.INACTIVE))))
				.setColor("#5F90EA")
				.setIcon("calendar") //same as in screen.json icon
				.setDescription("Inactive Clients. Press to filter List below");
		inactiveClients.setId(INACTIVE_CLIENTS_ID);
		result.add(inactiveClients);
		ClientStatsDTO inProgressClients = new ClientStatsDTO()
				.setTitle("In Progress Clients")
				.setValue(clientRepository.count(clientRepository.statusIn(List.of(ClientStatus.IN_PROGRESS))))
				.setColor("#4D83E7")
				.setIcon("pie-chart") //same as in screen.json icon
				.setDescription("In Progress Clients. Press to filter List below");
		inProgressClients.setId(IN_PROGRESS_CLIENTS);
		result.add(inProgressClients);
		return ResultPage.of(result, result.size());
	}

	@Override
	public MetaDTO getMeta(BusinessComponent bc) {
		MetaDTO rs = rowMeta.getExtremeResponse(RowMetaType.META, new ClientStatsDTO(), bc, null, false);
		Optional
				.ofNullable(rs.getRow().getFields().get(ClientStatsDTO_.value.getName()))
				.ifPresent(field -> {
					if (bc.getId() != null) {
						field.setDrillDownType(DrillDownType.INNER.getValue());
						field.setDrillDown("/screen/client/view/clientlist"
								+ "/" + CxboxRestController.client
								+ "?filters={\""
								+ CxboxRestController.client
								+ "\":\""
								+ ClientAbstractDTO_.status.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName()
								+ "=[\\\""
								+ getStatusFilterValues(bc.getId())
								+ "\\\"]"
								+ "\"}");
					}
				});
		return rs;
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
	public long count(BusinessComponent bc) {
		return ROWS_TOTAL;
	}

}

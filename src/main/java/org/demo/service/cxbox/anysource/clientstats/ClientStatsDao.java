package org.demo.service.cxbox.anysource.clientstats;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.entity.enums.ClientStatus;
import org.demo.repository.ClientRepository;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsDao extends AbstractAnySourceBaseDAO<ClientStatsDTO> implements
		AnySourceBaseDAO<ClientStatsDTO> {

	public static final int ROWS_TOTAL = 3;

	public static final String NEW_CLIENTS_ID = "0";

	public static final String INACTIVE_CLIENTS_ID = "1";

	public static final String IN_PROGRESS_CLIENTS = "2";

	private final ClientRepository clientRepository;

	@Override
	public String getId(final ClientStatsDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final ClientStatsDTO entity) {
		entity.setId(id);
	}

	@Override
	public ClientStatsDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getClientStats().stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<ClientStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getClientStats());
	}

	@Override
	public ClientStatsDTO update(BusinessComponent bc, ClientStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public ClientStatsDTO create(final BusinessComponent bc, final ClientStatsDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<ClientStatsDTO> getClientStats() {
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
		return result;
	}

}

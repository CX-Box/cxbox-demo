package org.demo.service.cxbox.anysource.clientstats;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.anysource.ClientStatsDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.ClientRepository;
import lombok.NonNull;
import org.demo.service.cxbox.anysource.StatisticUtils;
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

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	private final StatisticUtils statisticUtils;

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
		return getClientStats(bc).stream()
				.filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<ClientStatsDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getClientStats(bc));
	}

	@Override
	public ClientStatsDTO update(BusinessComponent bc, ClientStatsDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public ClientStatsDTO create(final BusinessComponent bc, final ClientStatsDTO entity) {
		throw new IllegalStateException();
	}

	public List<ClientStatsDTO> getClientStats(BusinessComponent bc) {
		AtomicInteger order = new AtomicInteger(1);
		return Arrays.stream(ClientStatus.values())
				.map(status -> createClientStatsDTO(
						status.getValue(),
						status,
						ClientStatus.colorsStatistic.get(status),
						ClientStatus.iconPie.get(status),
						String.valueOf(order.getAndIncrement()),
						status.getValue() + ". Press to filter List below",
						bc
				))
				.filter(dto -> dto.getValue() != 0)
				.toList();
	}

 	private ClientStatsDTO createClientStatsDTO(String title, ClientStatus status, String color, String icon,
			String id, String description, BusinessComponent bc) {

		Set<FieldOfActivity> filter = null;
		long value;
		boolean isDashboardClientStatsBC = bc.getName().equals(CxboxRestController.dashboardClientStats.getName());

		if (isDashboardClientStatsBC) {
			var parentField = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc);
			filter = Optional.ofNullable(parentField)
					.map(e -> e.getValues().stream()
							.map(v -> FieldOfActivity.getByValue(v.getValue()))
							.collect(Collectors.toSet()))
					.orElse(new HashSet<>());
			filter = filter.isEmpty() ? null : filter;
		}

		if (Objects.nonNull(filter)) {
			value = statisticUtils.countClientsByStatus(filter, status);
		} else {
			value = clientRepository.count(clientRepository.statusIn(List.of(status)));
		}
		return new ClientStatsDTO()
				.setTitle(title)
				.setValue(value)
				.setColor(color)
				.setIcon(icon)
				.setDescription(description);
	}

}

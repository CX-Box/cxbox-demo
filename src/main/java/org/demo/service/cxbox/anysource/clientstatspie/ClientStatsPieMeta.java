package org.demo.service.cxbox.anysource.clientstatspie;

import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.INACTIVE_CLIENTS_ID;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.IN_PROGRESS_CLIENTS;
import static org.demo.service.cxbox.anysource.clientstats.ClientStatsDao.NEW_CLIENTS_ID;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.crudma.PlatformRequest;
import org.cxbox.core.crudma.bc.BusinessComponent;
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
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClientStatsPieMeta extends AnySourceFieldMetaBuilder<ClientStatsDTO> {

	@Autowired
	private PlatformRequest platformRequest;

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientStatsDTO> fields, BcDescription bc,
			String id, String parentId) {

		fields.setDrilldown(
				ClientStatsDTO_.value,
				DrillDownType.INNER,
				urlFilterBuilder(id)
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

	private String urlFilterBuilder(@NonNull String id) {
		StringBuilder urlFilterBuilder = new StringBuilder("?filters={\"")
				.append(CxboxRestController.client)
				.append("\":\"");

		urlFilterBuilder.append(URLEncoder.encode(
				ClientAbstractDTO_.status.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName()
						+ "=[\\\""
						+ getStatusFilterValues(id)
						+ "\\\"]", StandardCharsets.UTF_8));

		if (parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()) != null &&
				!parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, getBc()).getValues().isEmpty()) {
			Set<FieldOfActivity> fieldOfActivitySet = parentDtoFirstLevelCache.getParentField(
							DashboardFilterDTO_.fieldOfActivity,
							getBc()
					)
					.getValues().stream()
					.map(v -> FieldOfActivity.getByValue(v.getValue()))
					.collect(Collectors.toSet());

			urlFilterBuilder.append(URLEncoder.encode(
					"&" + ClientReadDTO_.fieldOfActivity.getName() + "." + SearchOperation.EQUALS_ONE_OF.getOperationName() + "=["
							+
							fieldOfActivitySet.stream()
									.map(v -> "\\\"" + v.getValue() + "\\\"")
									.collect(Collectors.joining(", ")) +
							"]", StandardCharsets.UTF_8));
		}

		urlFilterBuilder.append("\"}");

		String urlBC = "screen/client/view/clientlist" + "/" + CxboxRestController.sale;
		return urlBC + urlFilterBuilder;
	}

	private BusinessComponent getBc() {
		return this.platformRequest.getBc();
	}

}

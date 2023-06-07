package org.demo.controller;

import org.demo.service.DadataCompanySuggestionPickListService;
import org.demo.service.DashboardClientActivitiesService;
import org.demo.service.ClientContactService;
import org.demo.service.ClientReadService;
import org.demo.service.ClientWriteService;
import org.demo.service.ContactPickListService;
import org.demo.service.DashboardFilterService;
import org.demo.service.DashboardSalesFunnelService;
import org.demo.service.DashboardSalesRingProgressService;
import org.demo.service.MeetingReadService;
import org.demo.service.MeetingWriteService;
import org.demo.service.ClientPickListService;
import org.demo.service.ResponsiblePickListService;
import org.demo.service.SaleReadService;
import org.demo.service.SaleWriteService;
import org.cxbox.core.crudma.bc.BcIdentifier;
import org.cxbox.core.crudma.bc.EnumBcIdentifier;
import org.cxbox.core.crudma.bc.impl.AbstractEnumBcSupplier;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import lombok.Getter;
import org.springframework.stereotype.Component;

/**
 * This is actually an analog of a usual @RestController.
 * When you add enum, you just add rest endpoints, that cxbox UI can call.
 * We could actually make a usual @RestController and make it Generic,
 * but current enum approach shows, that it is less error-prone in huge enterprise projects
 * (because single line in this enum creates >5 rest endpoints)
 */
@SuppressWarnings({"java:S115","java:S1144"})
@Getter
public enum CxboxRestController implements EnumBcIdentifier {

	// @formatter:on

	client(ClientReadService.class),
		contact(client, ClientContactService.class),
	clientEdit(ClientWriteService.class),
		contactEdit(clientEdit, ClientContactService.class),
		contactEditAssoc(clientEdit, ClientContactService.class),
	meeting(MeetingReadService.class),
	meetingEdit(MeetingWriteService.class),
		responsiblePickListPopup(meetingEdit, ResponsiblePickListService.class),
		clientPickListPopup(meetingEdit, ClientPickListService.class),
		contactPickListPopup(meetingEdit, ContactPickListService.class),
	sale(SaleReadService.class),
	saleEdit(SaleWriteService.class),
		clientSalePickListPopup(saleEdit, ClientPickListService.class),
	dashboardFilter(DashboardFilterService.class),
		dashboardClientActivities(dashboardFilter, DashboardClientActivitiesService.class),
	dashboardSalesFunnel(dashboardFilter, DashboardSalesFunnelService.class),
	dashboardSalesRingProgress(dashboardFilter, DashboardSalesRingProgressService.class),
	companySuggestionPickList(DadataCompanySuggestionPickListService.class);

	// @formatter:on

	public static final EnumBcIdentifier.Holder<CxboxRestController> Holder = new Holder<>(CxboxRestController.class);

	private final BcDescription bcDescription;

	CxboxRestController(String parentName, Class<?> serviceClass, boolean refresh) {
		this.bcDescription = buildDescription(parentName, serviceClass, refresh);
	}

	CxboxRestController(String parentName, Class<?> serviceClass) {
		this(parentName, serviceClass, false);
	}

	CxboxRestController(BcIdentifier parent, Class<?> serviceClass, boolean refresh) {
		this(parent == null ? null : parent.getName(), serviceClass, refresh);
	}

	CxboxRestController(BcIdentifier parent, Class<?> serviceClass) {
		this(parent, serviceClass, false);
	}

	CxboxRestController(Class<?> serviceClass, boolean refresh) {
		this((String) null, serviceClass, refresh);
	}

	CxboxRestController(Class<?> serviceClass) {
		this((String) null, serviceClass, false);
	}

	@Component
	public static class BcSupplier extends AbstractEnumBcSupplier<CxboxRestController> {

		public BcSupplier() {
			super(CxboxRestController.Holder);
		}

	}

}

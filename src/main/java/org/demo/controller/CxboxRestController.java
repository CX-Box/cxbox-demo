package org.demo.controller;

import lombok.Getter;
import org.cxbox.api.data.BcIdentifier;
import org.cxbox.core.crudma.bc.EnumBcIdentifier;
import org.cxbox.core.crudma.bc.impl.AbstractEnumBcSupplier;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.demo.conf.cxbox.extension.jobRunr.service.state.JobStatsService;
import org.demo.service.cxbox.anysource.clientstats.ClientStatsService;
import org.demo.conf.cxbox.extension.jobRunr.service.job.JobAdminService;
import org.demo.service.cxbox.anysource.dadatacompany.CompanyService;
import org.demo.service.cxbox.anysource.lov.LovReadService;
import org.demo.service.cxbox.anysource.saleprogress.SaleProgressStatsService;
import org.demo.service.cxbox.anysource.salestats.SaleStatsService;
import org.demo.service.cxbox.inner.ClientContactService;
import org.demo.service.cxbox.inner.ClientPickListService;
import org.demo.service.cxbox.inner.ClientReadWriteService;
import org.demo.service.cxbox.inner.ContactMultivalueService;
import org.demo.service.cxbox.inner.ContactPickListService;
import org.demo.service.cxbox.inner.DashboardClientActivitiesService;
import org.demo.service.cxbox.inner.DashboardFilterService;
import org.demo.service.cxbox.inner.core.DictionaryService;
import org.demo.service.cxbox.inner.core.DictionaryTypeService;
import org.demo.service.cxbox.inner.MeetingDocumentsWriteService;
import org.demo.service.cxbox.inner.MeetingReadService;
import org.demo.service.cxbox.inner.MeetingWriteService;
import org.demo.service.cxbox.inner.core.RoleViewService;
import org.demo.service.cxbox.inner.ResponsiblePickListService;

import org.demo.service.cxbox.inner.SaleReadService;
import org.demo.service.cxbox.inner.SaleWriteService;
import org.springframework.stereotype.Component;

/**
 * This is actually an analog of a usual @RestController.
 * When you add enum, you just add rest endpoints, that cxbox UI can call.
 * We could actually make a usual @RestController and make it Generic,
 * but current enum approach shows, that it is less error-prone in huge enterprise projects
 * (because single line in this enum creates >5 rest endpoints)
 */
@SuppressWarnings({"java:S115", "java:S1144"})
@Getter
public enum CxboxRestController implements EnumBcIdentifier {

	// @formatter:off
	//application
	clientStats(ClientStatsService.class),
	client(ClientReadWriteService.class),
		contact(client, ClientContactService.class),
	clientEdit(ClientReadWriteService.class),
		contactEdit(clientEdit, ClientContactService.class),
		contactEditAssoc(clientEdit, ClientContactService.class),
	meeting(MeetingReadService.class),
		meetingDocumentEdit(meeting, MeetingDocumentsWriteService.class),
	meetingEdit(MeetingWriteService.class),
	contactAssocListPopup(meetingEdit, ContactMultivalueService.class),
		responsiblePickListPopup(meetingEdit, ResponsiblePickListService.class),
		clientPickListPopup(meetingEdit, ClientPickListService.class),
		contactPickListPopup(meetingEdit, ContactPickListService.class),
	sale(SaleReadService.class),
	saleEdit(SaleWriteService.class),
		clientSalePickListPopup(saleEdit, ClientPickListService.class),
	dashboardFilter(DashboardFilterService.class),
		dashboardClientActivities(dashboardFilter, DashboardClientActivitiesService.class),
	dashboardSalesFunnel(dashboardFilter, SaleStatsService.class),
	dashboardSalesRingProgress(dashboardFilter, SaleProgressStatsService.class),
	companySuggestionPickList(CompanyService.class),

	//administration
	dictionary(DictionaryService.class),
		dictionaryType(dictionary, DictionaryTypeService.class),
	lovExternal(LovReadService.class),
	jobsStats(JobStatsService.class),
		scheduledJobs(jobsStats, JobAdminService.class),
		enqueuedJobs(jobsStats, JobAdminService.class),
		processingJobs(jobsStats, JobAdminService.class),
		succeededJobs(jobsStats, JobAdminService.class),
		failedJobs(jobsStats, JobAdminService.class),
		deletedJobs(jobsStats, JobAdminService.class),
	responsibilities(RoleViewService.class);

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

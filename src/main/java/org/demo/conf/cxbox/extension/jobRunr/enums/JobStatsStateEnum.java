package org.demo.conf.cxbox.extension.jobRunr.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Arrays;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.demo.controller.CxboxRestController;
import org.jobrunr.jobs.states.StateName;

@Getter
@AllArgsConstructor
public enum JobStatsStateEnum {

	SCHEDULED("Scheduled", StateName.SCHEDULED, "", "#779FE9", "clock-circle", "scheduledJobs", CxboxRestController.scheduledJobs),
	ENQUEUED("Enqueued", StateName.ENQUEUED, "", "#779FE9", "history", "enqueuedJobs", CxboxRestController.enqueuedJobs),
	PROCESSING("Processing", StateName.PROCESSING, "", "#779FE9", "code", "processingJobs", CxboxRestController.processingJobs),
	SUCCEEDED("Succeeded", StateName.SUCCEEDED, "", "#779FE9", "check-circle", "succeededJobs", CxboxRestController.succeededJobs),
	FAILED("Failed", StateName.FAILED, "", "#779FE9", "exclamation-circle", "failedJobs", CxboxRestController.failedJobs),
	DELETED("Deleted", StateName.DELETED, "", "#779FE9", "delete", "deletedJobs", CxboxRestController.deletedJobs);

	@JsonValue
	private final String value;

	private final StateName stateName;

	private final String description;

	private final String color;

	private String icon;

	private String adminView;

	private CxboxRestController bc;


	public static String mapToId(JobStatsStateEnum statsState) {
		return statsState.name();
	}

	public static JobStatsStateEnum getById(String id) {
		return Arrays.stream(JobStatsStateEnum.values()).sequential().filter(v -> v.name().equals(id)).findFirst().orElse(null);
	}

	public static JobStatsStateEnum getByBc(BusinessComponent bc) {
		return Arrays.stream(JobStatsStateEnum.values()).sequential().filter(v -> v.getBc().isBc(bc)).findFirst().orElse(null);
	}

}
package org.demo.service;

import java.util.Optional;
import org.cxbox.api.data.dto.rowmeta.FieldDTO;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.MeetingDTO;
import org.demo.dto.MeetingDTO_;
import org.demo.entity.enums.MeetingStatus;
import org.demo.entity.enums.ProcessEnum;
import org.demo.entity.enums.ResolutionEnum;
import org.demo.entity.enums.TypeEnum;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingWriteMeta extends FieldMetaBuilder<MeetingDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MeetingDTO_.description);
		fields.setEnabled(MeetingDTO_.slaDate);
		/*fields.setEnumValues(MeetingDTO_.process, ProcessEnum.values());
		fields.setEnabled(MeetingDTO_.process);*/
		fields.setEnabled(MeetingDTO_.customerId);
		fields.setEnabled(MeetingDTO_.customer);
		fields.setEnabled(MeetingDTO_.curatorId);
		fields.setEnabled(MeetingDTO_.curator);
		/*fields.setEnabled(MeetingDTO_.registratinDate);*/
		fields.setEnumValues(MeetingDTO_.resolution, ResolutionEnum.values());
		fields.setEnabled(MeetingDTO_.resolution);
		fields.setEnumValues(MeetingDTO_.type, TypeEnum.values());
		fields.setEnabled(MeetingDTO_.type);
		/*fields.setEnabled(MeetingDTO_.object);*/
		fields.setEnabled(MeetingDTO_.additionalContacts);
		fields.setEnabled(MeetingDTO_.status);
		fields.setEnumValues(MeetingDTO_.status, MeetingStatus.values());
		if (fields.get(MeetingDTO_.status) != null && MeetingStatus.IN_COMPLETION.equals(fields.get(MeetingDTO_.status)
				.getCurrentValue())) {
			fields.setEnabled(
					MeetingDTO_.notes,
					MeetingDTO_.result
			);
		} else {
			fields.setEnabled(
					MeetingDTO_.agenda,
					MeetingDTO_.startDateTime,
					MeetingDTO_.endDateTime,
					MeetingDTO_.address,
					MeetingDTO_.responsibleName,
					MeetingDTO_.responsibleId,
					MeetingDTO_.clientName,
					MeetingDTO_.clientId,
					MeetingDTO_.contactName,
					MeetingDTO_.contactId
			);
			if (fields.get(MeetingDTO_.clientId) != null && fields.get(MeetingDTO_.clientId).getCurrentValue() != null) {
				fields.setEnabled(
						MeetingDTO_.contactName,
						MeetingDTO_.contactId
				);
			}
		}

		fields.setRequired(
				MeetingDTO_.agenda,
				MeetingDTO_.startDateTime,
				MeetingDTO_.endDateTime,
				MeetingDTO_.address
		);

		fields.setDrilldown(
				MeetingDTO_.link,
				DrillDownType.INNER,
				"/screen/meeting/view/meetingedit/" + CxboxRestController.meetingEdit + "/" + id
		);

		fields.setDrilldown(
				MeetingDTO_.id,
				DrillDownType.INNER,
				"/screen/meeting/view/meetingedit/" + CxboxRestController.meetingEdit + "/" + id
		);
		if (Optional.ofNullable(fields.get(MeetingDTO_.clientId)).map(FieldDTO::getCurrentValue).isPresent()) {
			fields.setDrilldown(
					MeetingDTO_.clientName,
					DrillDownType.INNER,
					"/screen/client/view/clientview/" + CxboxRestController.client + "/" +
							fields.get(MeetingDTO_.clientId).getCurrentValue()
			);
		}
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.enableFilter(MeetingDTO_.agenda);
		fields.enableFilter(MeetingDTO_.curator);
		fields.enableFilter(MeetingDTO_.responsibleName);
		fields.enableFilter(MeetingDTO_.description);
		fields.enableFilter(MeetingDTO_.slaDate);
		fields.setEnumFilterValues(fields, MeetingDTO_.process, ProcessEnum.values());
		fields.enableFilter(MeetingDTO_.process);
		fields.enableFilter(MeetingDTO_.customer);
		fields.enableFilter(MeetingDTO_.registratinDate);
		fields.setEnumFilterValues(fields, MeetingDTO_.resolution, ResolutionEnum.values());
		fields.enableFilter(MeetingDTO_.resolution);
		fields.setEnumFilterValues(fields, MeetingDTO_.type, TypeEnum.values());
		fields.enableFilter(MeetingDTO_.type);
		fields.enableFilter(MeetingDTO_.object);
		fields.enableFilter(MeetingDTO_.additionalContacts);
		fields.setForceActive(MeetingDTO_.clientId);
		fields.setForceActive(MeetingDTO_.startDateTime);
		fields.setForceActive(MeetingDTO_.endDateTime);
	}

}
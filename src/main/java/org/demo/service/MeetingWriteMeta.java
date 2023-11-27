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
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingWriteMeta extends FieldMetaBuilder<MeetingDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MeetingDTO_.additionalContacts);
		if (MeetingStatus.IN_COMPLETION.equals(fields.get(MeetingDTO_.status).getCurrentValue())) {
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
			if (fields.get(MeetingDTO_.clientId).getCurrentValue() != null) {
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
				MeetingDTO_.id,
				DrillDownType.INNER,
				"/screen/meeting/view/meetingview/" + CxboxRestController.meeting + "/" + id
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
		fields.enableFilter(MeetingDTO_.additionalContacts);
		fields.setForceActive(MeetingDTO_.clientId);
		fields.setForceActive(MeetingDTO_.startDateTime);
		fields.setForceActive(MeetingDTO_.endDateTime);
	}

}
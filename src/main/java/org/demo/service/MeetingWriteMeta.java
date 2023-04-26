package org.demo.service;

import org.demo.dto.MeetingDTO;
import org.demo.dto.MeetingDTO_;
import org.demo.entity.enums.MeetingStatus;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.springframework.stereotype.Service;

@Service
public class MeetingWriteMeta extends FieldMetaBuilder<MeetingDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		if (MeetingStatus.Completed.equals(fields.get(MeetingDTO_.status).getCurrentValue())) {
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

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.setForceActive(MeetingDTO_.clientId);
		fields.setForceActive(MeetingDTO_.startDateTime);
		fields.setForceActive(MeetingDTO_.endDateTime);
	}

}

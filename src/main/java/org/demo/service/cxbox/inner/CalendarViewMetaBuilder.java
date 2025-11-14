package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.springframework.stereotype.Service;

@Service
public class CalendarViewMetaBuilder extends FieldMetaBuilder<MeetingDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setDrilldown(
				MeetingDTO_.agenda,
				DrillDownType.INNER,
				"/screen/meeting/view/meetingview/meeting/" + id
		);
		fields.setEnabled(MeetingDTO_.agenda, MeetingDTO_.startDateTime, MeetingDTO_.endDateTime);
		fields.setRequired(MeetingDTO_.agenda, MeetingDTO_.endDateTime, MeetingDTO_.startDateTime);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.setForceActive(MeetingDTO_.startDateTime);
		fields.enableSort(MeetingDTO_.startDateTime);
		fields.enableFilter(MeetingDTO_.startDateTime);
		fields.setForceActive(MeetingDTO_.endDateTime);
		fields.enableSort(MeetingDTO_.endDateTime);
		fields.enableFilter(MeetingDTO_.endDateTime);
	}

}

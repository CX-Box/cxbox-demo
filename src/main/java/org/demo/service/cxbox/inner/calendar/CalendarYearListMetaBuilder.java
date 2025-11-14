package org.demo.service.cxbox.inner.calendar;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.CalendarYearMeetingDTO;
import org.demo.dto.cxbox.inner.CalendarYearMeetingDTO_;
import org.springframework.stereotype.Service;

@Service
public class CalendarYearListMetaBuilder extends FieldMetaBuilder<CalendarYearMeetingDTO> {


	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<CalendarYearMeetingDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<CalendarYearMeetingDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(CalendarYearMeetingDTO_.endDateTime);
		fields.enableFilter(CalendarYearMeetingDTO_.startDateTime);
		fields.enableSort(CalendarYearMeetingDTO_.endDateTime);
		fields.enableSort(CalendarYearMeetingDTO_.startDateTime);
	}

}

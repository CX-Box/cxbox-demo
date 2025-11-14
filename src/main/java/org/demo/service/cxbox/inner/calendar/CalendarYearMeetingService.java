package org.demo.service.cxbox.inner.calendar;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.CalendarYearMeetingDTO;
import org.demo.entity.CalendarYearMeeting;
import org.springframework.stereotype.Service;


@SuppressWarnings("java:S1170")
@Getter
@Service
@RequiredArgsConstructor
public class CalendarYearMeetingService extends
		VersionAwareResponseService<CalendarYearMeetingDTO, CalendarYearMeeting> {

	@Getter(onMethod_ = @Override)
	private final Class<CalendarYearListMetaBuilder> meta = CalendarYearListMetaBuilder.class;

	@Override
	protected CreateResult<CalendarYearMeetingDTO> doCreateEntity(CalendarYearMeeting entity, BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<CalendarYearMeetingDTO> doUpdateEntity(CalendarYearMeeting entity,
			CalendarYearMeetingDTO data,
			BusinessComponent bc) {
		return null;
	}


}
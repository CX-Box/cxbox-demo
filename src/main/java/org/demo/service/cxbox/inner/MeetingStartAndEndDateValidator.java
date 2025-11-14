package org.demo.service.cxbox.inner;


import static org.demo.dto.cxbox.inner.MeetingDTO_.endDateTime;

import lombok.experimental.UtilityClass;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dto.BusinessError.Entity;
import org.cxbox.core.exception.BusinessException;
import org.demo.dto.cxbox.inner.MeetingDTO;

@UtilityClass
public class MeetingStartAndEndDateValidator {

	public static void validateStartAndEndDate(BusinessComponent bc, MeetingDTO dto) {
		if (dto.getEndDateTime() != null && dto.getStartDateTime().isAfter(dto.getEndDateTime())) {
			BusinessException validationException = new BusinessException();
			validationException.setEntity(new Entity(bc));
			validationException.getEntity()
					.addField(endDateTime.getName(), "End Date cannot be earlier than Start Date");
			throw validationException;
		}
	}


}

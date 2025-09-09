package org.demo.service.cxbox.anysource.meetingsstats;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.MeetingStatsDTO;
import org.springframework.stereotype.Service;

@Service
public class MeetingStatsMetaBuilder extends AnySourceFieldMetaBuilder<MeetingStatsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingStatsDTO> fields, BcDescription bcDescription,
			String id,
			String parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingStatsDTO> fields, BcDescription bcDescription, String parentId) {

	}

}

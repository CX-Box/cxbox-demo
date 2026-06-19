package org.demo.service.cxbox.anysource.meetingsstats;

import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.AnySourceFieldMetaBuilder;
import org.demo.dto.cxbox.anysource.BaseStatsDTO;
import org.springframework.stereotype.Service;

@Service
public class MeetingStatsMetaBuilder extends AnySourceFieldMetaBuilder<BaseStatsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<BaseStatsDTO> fields, BcDescription bcDescription,
			String id,
			String parentId) {
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<BaseStatsDTO> fields, BcDescription bcDescription, String parentId) {

	}

}

package org.demo.service.cxbox.inner;

import java.util.Optional;
import org.cxbox.api.data.dto.rowmeta.FieldDTO;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.cxbox.inner.MeetingDTO_;
import org.demo.entity.enums.MeetingStatus;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class MeetingReadMeta extends FieldMetaBuilder<MeetingDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
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
	public void buildIndependentMeta(FieldsMeta<MeetingDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(MeetingDTO_.id);
		fields.enableFilter(MeetingDTO_.agenda);
		fields.enableFilter(MeetingDTO_.startDateTime);
		fields.enableFilter(MeetingDTO_.status);
		fields.setEnumFilterValues(fields, MeetingDTO_.status, MeetingStatus.values());
		fields.enableFilter(MeetingDTO_.clientName);
		fields.enableFilter(MeetingDTO_.contactName);
	}

}

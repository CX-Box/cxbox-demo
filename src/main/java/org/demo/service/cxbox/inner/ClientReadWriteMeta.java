package org.demo.service.cxbox.inner;

import java.util.Arrays;
import java.util.stream.Collectors;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.ClientReadDTO_;
import org.demo.dto.cxbox.inner.ClientWriteDTO;
import org.demo.dto.cxbox.inner.ClientWriteDTO_;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ClientReadWriteMeta extends FieldMetaBuilder<ClientWriteDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientWriteDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ClientWriteDTO_.fullName,
				ClientWriteDTO_.address,
				ClientWriteDTO_.importance,
				ClientWriteDTO_.fieldOfActivity,
				ClientWriteDTO_.briefId,
				ClientWriteDTO_.brief,
				ClientWriteDTO_.editStep,
				ClientWriteDTO_.status
		);
		fields.setRequired(
				ClientWriteDTO_.fullName,
				ClientWriteDTO_.importance,
				ClientWriteDTO_.address,
				ClientWriteDTO_.fieldOfActivity,
				ClientWriteDTO_.status
		);

		fields.setDictionaryValues(ClientWriteDTO_.importance);

		fields.setEnumValues(
				ClientWriteDTO_.editStep, ClientEditStep.valuesWithLocale());

		fields.setEnumValues(ClientWriteDTO_.status, ClientStatus.valuesWithLocale());

		fields.setConcreteValues(
				ClientWriteDTO_.fieldOfActivity,
				Arrays.stream(FieldOfActivity.values())
						.map(e -> new SimpleDictionary(e.name(), e.getValue()))
						.toList()
		);

		fields.setDrilldown(
				ClientReadDTO_.fullName,
				DrillDownType.INNER,
				"/screen/client/view/clientview/" + CxboxRestController.clientEdit + "/" + id
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientWriteDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(ClientWriteDTO_.fieldOfActivity);
		fields.setConcreteFilterValues(
				ClientWriteDTO_.fieldOfActivity, Arrays
						.stream(FieldOfActivity.values())
						.map(en -> new SimpleDictionary(en.name(), en.getValue()))
						.collect(Collectors.toList())
		);
		fields.enableFilter(ClientWriteDTO_.fullName);
		fields.enableSort(ClientWriteDTO_.fullName);
		fields.enableFilter(ClientWriteDTO_.address);
		fields.enableSort(ClientWriteDTO_.address);
		fields.enableFilter(ClientWriteDTO_.importance);
		fields.enableSort(ClientWriteDTO_.importance);
		fields.setDictionaryFilterValues(ClientWriteDTO_.importance);
		fields.enableSort(ClientWriteDTO_.importance);
		fields.enableFilter(ClientWriteDTO_.status);
		fields.enableSort(ClientWriteDTO_.status);
		fields.setEnumFilterValues(fields, ClientWriteDTO_.status, ClientStatus.valuesWithLocale());
	}

}

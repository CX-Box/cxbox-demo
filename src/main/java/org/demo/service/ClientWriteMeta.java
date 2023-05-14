package org.demo.service;

import org.demo.dto.ClientWriteDTO_;
import org.demo.entity.enums.ClientEditStep;
import org.demo.entity.enums.ClientImportance;
import org.demo.entity.enums.ClientStatus;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.dto.ClientWriteDTO;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import java.util.Arrays;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252","java:S1186"})
@Service
public class ClientWriteMeta extends FieldMetaBuilder<ClientWriteDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ClientWriteDTO> fields, InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(
				ClientWriteDTO_.fullName,
				ClientWriteDTO_.address,
				ClientWriteDTO_.importance,
				ClientWriteDTO_.fieldOfActivity,
				ClientWriteDTO_.breifId,
				ClientWriteDTO_.breif,
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

		fields.setEnumValues(ClientWriteDTO_.importance, ClientImportance.values());

		fields.setEnumValues(ClientWriteDTO_.editStep, ClientEditStep.values());

		fields.setEnumValues(ClientWriteDTO_.status, ClientStatus.values());

		fields.setDictionaryTypeWithCustomValues(
				ClientWriteDTO_.fieldOfActivity,
				Arrays.stream(FieldOfActivity.values())
						.map(FieldOfActivity::getValue)
						.toArray(String[]::new)
		);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ClientWriteDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
	}

}

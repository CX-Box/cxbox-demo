package org.demo.service.cxbox.inner;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.GenerationDTO;
import org.demo.dto.cxbox.inner.GenerationDTO_;
import org.demo.entity.enums.DetalizationEnum;
import org.demo.entity.enums.StyleEnum;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class GenerationMeta extends FieldMetaBuilder<GenerationDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<GenerationDTO> fields, InnerBcDescription bcDescription,
			Long id,
			Long parentId) {
		fields.setEnabled(GenerationDTO_.overridePrompt);
		fields.setEnumValues(GenerationDTO_.detalization, DetalizationEnum.values());
		fields.setEnabled(GenerationDTO_.detalization);
		fields.setRequired(GenerationDTO_.detalization);
		fields.setEnumValues(GenerationDTO_.style, StyleEnum.values());
		fields.setEnabled(GenerationDTO_.style);
		fields.setRequired(GenerationDTO_.style);

		fields.setEnabled(
				GenerationDTO_.name
		);
		fields.setRequired(GenerationDTO_.name);

		fields.setDrilldown(
				GenerationDTO_.id,
				DrillDownType.INNER,
				"/screen/generation/view/generation/" + CxboxRestController.generation + "/" + id
		);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<GenerationDTO> fields, InnerBcDescription bcDescription, Long parentId) {
		fields.enableFilter(GenerationDTO_.overridePrompt);
		fields.setEnumFilterValues(fields, GenerationDTO_.detalization, DetalizationEnum.values());
		fields.enableFilter(GenerationDTO_.detalization);
		fields.setEnumFilterValues(fields, GenerationDTO_.style, StyleEnum.values());
		fields.enableFilter(GenerationDTO_.style);

	}

}

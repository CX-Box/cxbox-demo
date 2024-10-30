package org.demo.service.cxbox.inner;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.api.data.dto.rowmeta.FieldDTO.Hierarchy;
import org.cxbox.api.data.dto.rowmeta.FieldDTO.Level;
import org.cxbox.constgen.DtoField;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO;
import org.demo.dto.cxbox.inner.MeetingDocumentsDTO_;
import org.demo.entity.enums.Briefings;
import org.demo.entity.enums.Documents;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class MeetingDocumentsWriteMeta extends FieldMetaBuilder<MeetingDocumentsDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<MeetingDocumentsDTO> fields,
			InnerBcDescription bcDescription,
			Long id, Long parentId) {
		fields.setEnabled(MeetingDocumentsDTO_.fileId);
		fields.setEnabled(MeetingDocumentsDTO_.file);
		fields.setEnabled(
				MeetingDocumentsDTO_.notes);
		fields.setEnabled(MeetingDocumentsDTO_.briefing);
		fields.setEnabled(MeetingDocumentsDTO_.document);

		fields.setEnumValues(MeetingDocumentsDTO_.briefing, Briefings.values());
		fields.setEnumValues(MeetingDocumentsDTO_.document, Documents.values());
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<MeetingDocumentsDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(MeetingDocumentsDTO_.file);
		fields.enableSort(MeetingDocumentsDTO_.file);
		fields.setFileAccept(MeetingDocumentsDTO_.file, List.of(".png", ".pdf", ".jpg", ".jpeg"));
		fields.enableSort(MeetingDocumentsDTO_.document);
		fields.enableSort(MeetingDocumentsDTO_.briefing);
		fields.enableSort(MeetingDocumentsDTO_.id);
		fields.enableSort(MeetingDocumentsDTO_.notes);

		groupingHierarchy(
				fields,
				MeetingDocumentsDTO_.document,
				MeetingDocumentsDTO_.briefing,
				MeetingDocumentsDTO_.document,
				Set.of(
						Level.builder(
								Documents.COMPLIANCE_DOCUMENT,
								Set.of(
										Level.builder(
												Briefings.FINANCIAL_BRIEFING,
												Set.of(Level.builder(Documents.REFERENCE_DOCUMENT).build())
										).build(),
										Level.builder(
												Briefings.PROJECT_BRIEFING,
												Set.of(Level.builder(Documents.TECHNICAL_DOCUMENT).build())
										).build()
								)
						).build(),
						Level.builder(
								Documents.POLICY_DOCUMENT,
								Set.of(
										Level.builder(
												Briefings.SECURITY_BRIEFING,
												Set.of(Level.builder(Documents.LEGAL_DOCUMENT).build())
										).build()
								)
						).build()
				)
		);
	}

	private <D extends DataResponseDTO, E1> void groupingHierarchy(FieldsMeta<D> fields,
			DtoField<D, E1> field1,
			Set<? extends Level<E1, ?>> levels) {

		Hierarchy hierarchy = new Hierarchy(List.of(field1.getName()), levels);
		Optional.ofNullable(fields.get(field1.getName())).ifPresent(fieldDTO -> fieldDTO.setGroupingHierarchy(hierarchy));
	}

	private <D extends DataResponseDTO, E1, E2> void groupingHierarchy(FieldsMeta<D> fields,
			DtoField<D, E1> field1,
			DtoField<D, E2> field2,
			Set<? extends Level<E1, ? extends Level<E2, ?>>> levels) {

		Hierarchy hierarchy = new Hierarchy(List.of(field1.getName(), field2.getName()), levels);
		Optional.ofNullable(fields.get(field1.getName())).ifPresent(fieldDTO -> fieldDTO.setGroupingHierarchy(hierarchy));
	}


	private <D extends DataResponseDTO, E1, E2, E3> void groupingHierarchy(FieldsMeta<D> fields,
			DtoField<D, E1> field1,
			DtoField<D, E2> field2,
			DtoField<D, E3> field3,
			Set<? extends Level<E1, ? extends Level<E2, ? extends Level<E3, ?>>>> levels) {
		Hierarchy hierarchy = new Hierarchy(List.of(field1.getName(), field2.getName(), field3.getName()), levels);
		Optional.ofNullable(fields.get(field1.getName())).ifPresent(fieldDTO -> fieldDTO.setGroupingHierarchy(hierarchy));
	}

}
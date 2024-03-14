package org.demo.service.cxbox.inner;

import static org.demo.conf.cxbox.extension.lov.AdministeredDictionaryType.INTERNAL_ROLE;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.cxbox.meta.entity.Responsibilities_;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO;
import org.cxbox.meta.metahotreload.service.MetaResourceReaderService;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO;

import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO_;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@AllArgsConstructor
public class ResponsibilitesMeta extends FieldMetaBuilder<ResponsibilitesCrudDTO> {

	private final MetaResourceReaderService metaResourceReaderService;

	private final JpaDao jpaDao;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibilitesCrudDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {
		fields.setDictionaryTypeWithAllValues(ResponsibilitesCrudDTO_.internalRoleCD, INTERNAL_ROLE);
		fields.setRequired(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setRequired(ResponsibilitesCrudDTO_.respType);
		fields.setRequired(ResponsibilitesCrudDTO_.view);
		fields.setEnabled(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setEnabled(ResponsibilitesCrudDTO_.view);
		fields.setEnabled(ResponsibilitesCrudDTO_.readOnly);
		fields.setEnabled(ResponsibilitesCrudDTO_.departmentId);
		fields.setEnumValues(ResponsibilitesCrudDTO_.respType, ResponsibilityType.values());

		List<SimpleDictionary> viewNameSimpl = new ArrayList<>();

		diffViewDBMeta().stream()
				.forEach(resp -> viewNameSimpl.add(new SimpleDictionary(resp.getView(), resp.getView(), true)));
		fields.setConcreteValues(ResponsibilitesCrudDTO_.view, viewNameSimpl);

	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibilitesCrudDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.setAllFilterValuesByLovType(ResponsibilitesCrudDTO_.internalRoleCD, INTERNAL_ROLE);
		fields.setDictionaryTypeWithAllValues(ResponsibilitesCrudDTO_.internalRoleCD, INTERNAL_ROLE);
		fields.enableFilter(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setForceActive(ResponsibilitesCrudDTO_.internalRoleCD);
	}

	private List<Responsibilities> diffViewDBMeta() {
		List<Responsibilities> viewDB = getAllView();
		List<ViewSourceDTO> viewDtos = metaResourceReaderService.getViews();
		List<Responsibilities> responsibilities = new ArrayList<>();
		viewDtos.forEach(view -> view.getRolesAllowed()
				.forEach(role -> responsibilities.add(new Responsibilities().setResponsibilityType(ResponsibilityType.VIEW)
						.setInternalRoleCD(new LOV(role)).setView(view.getName()))));
		if (!viewDB.isEmpty()) {
			Map<String, Responsibilities> keyViewsBD = viewDB.stream().filter(v -> v.getInternalRoleCD() != null)
					.collect(Collectors.toMap(a -> a.getInternalRoleCD().getKey() + a.getView(), resp -> resp));

			Map<String, Responsibilities> keyViewsMeta = responsibilities.stream()
					.collect(Collectors.toMap(a -> a.getInternalRoleCD().getKey() + a.getView(), resp -> resp));
			return searchDiffData(keyViewsMeta, keyViewsBD);
		}
		return new ArrayList<>();
	}

	private List<Responsibilities> searchDiffData(Map<String, Responsibilities> map,
			Map<String, Responsibilities> mapForSearch) {
		return map.entrySet().stream().filter(keyView -> !mapForSearch.containsKey(keyView.getKey())).map(Entry::getValue)
				.toList();
	}

	public List<Responsibilities> getAllView() {
		return jpaDao.getList(
				Responsibilities.class,
				(root, cq, cb) -> cb.equal(root.get(Responsibilities_.responsibilityType), ResponsibilityType.VIEW)
		);
	}

}
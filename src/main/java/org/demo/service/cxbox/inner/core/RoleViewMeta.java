package org.demo.service.cxbox.inner.core;

import jakarta.annotation.Nullable;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.cxbox.meta.entity.Responsibilities_;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.extension.resposibilities.ResponsibilitiesServiceExt;
import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO;
import org.demo.dto.cxbox.inner.ResponsibilitesCrudDTO_;
import org.demo.entity.dictionary.InternalRole;
import org.demo.repository.ResponsibilitiesRepository;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@AllArgsConstructor
public class RoleViewMeta extends FieldMetaBuilder<ResponsibilitesCrudDTO> {

	private final JpaDao jpaDao;

	private final ResponsibilitiesServiceExt responsibilitiesServiceExt;

	private final ResponsibilitiesRepository responsibilitiesRepository;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibilitesCrudDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {

		fields.setEnabled(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setRequired(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setDictionaryValues(ResponsibilitesCrudDTO_.internalRoleCD);

		fields.setEnabled(ResponsibilitesCrudDTO_.view);
		fields.setRequired(ResponsibilitesCrudDTO_.view);

		InternalRole role = (InternalRole) fields.get(ResponsibilitesCrudDTO_.internalRoleCD).getCurrentValue();
		Set<String> unassignedViewsForRole = diffViewDBMeta(role);
		fields.setConcreteValues(ResponsibilitesCrudDTO_.view, unassignedViewsForRole
				.stream()
				.map(view -> new SimpleDictionary(view, view, true))
				.toList());
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibilitesCrudDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setDictionaryFilterValues(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.setForceActive(ResponsibilitesCrudDTO_.internalRoleCD);
		fields.enableSort(ResponsibilitesCrudDTO_.internalRoleCD);

		fields.enableFilter(ResponsibilitesCrudDTO_.view);
		fields.setConcreteFilterValues(
				ResponsibilitesCrudDTO_.view,
				responsibilitiesServiceExt.getAllViews()
						.stream()
						.map(view -> new SimpleDictionary(view.getName(), view.getName(), true))
						.toList()
		);
		fields.setForceActive(ResponsibilitesCrudDTO_.view);
		fields.enableSort(ResponsibilitesCrudDTO_.view);

		fields.enableFilter(ResponsibilitesCrudDTO_.viewWidgets);
		fields.setConcreteFilterValues(
				ResponsibilitesCrudDTO_.viewWidgets,
				responsibilitiesServiceExt.getAllWidgetsNameToDescription().entrySet()
						.stream()
						.map(entry -> new SimpleDictionary(entry.getKey(), entry.getValue(), true))
						.toList()
		);
	}

	private Set<String> diffViewDBMeta(@Nullable InternalRole role) {
		var viewsDB = getResponsibilityViews(role).stream().map(Responsibilities::getView).filter(Objects::nonNull).collect(Collectors.toSet());
			var viewsMeta = responsibilitiesServiceExt.getAllViews().stream()
					.map(ViewSourceDTO::getName)
					.collect(Collectors.toSet());
			viewsMeta.removeAll(viewsDB);
			return viewsMeta;
	}

	public List<Responsibilities> getResponsibilityViews(@Nullable InternalRole role) {
			return jpaDao.getList(
					Responsibilities.class,
					(root, cq, cb) -> cb.and(
							cb.equal(root.get(Responsibilities_.responsibilityType), ResponsibilityType.VIEW),
							role != null ?  cb.equal(root.get(Responsibilities_.internalRoleCD), role.key()) : cb.and()
					)
			);
	}

}
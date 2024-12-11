package org.demo.conf.cxbox.customization.responsibilities.service;

import static org.demo.conf.cxbox.customization.responsibilities.dto.ResponsibilitiesAdminDTO_.*;

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
import org.cxbox.dictionary.DictionaryProvider;
import org.cxbox.meta.entity.Responsibilities;
import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.cxbox.meta.entity.Responsibilities_;
import org.cxbox.meta.metahotreload.dto.ViewSourceDTO;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.conf.cxbox.customization.metaAdmin.MetaAdminServiceExt;
import org.demo.conf.cxbox.customization.responsibilities.dto.ResponsibilitiesAdminDTO;
import org.demo.entity.dictionary.InternalRole;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@AllArgsConstructor
public class ResponsibilitiesAdminMeta extends FieldMetaBuilder<ResponsibilitiesAdminDTO> {

	private final JpaDao jpaDao;

	private final MetaAdminServiceExt metaAdminServiceExt;

	private final DictionaryProvider dictionaryProvider;

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<ResponsibilitiesAdminDTO> fields,
			InnerBcDescription bcDescription, Long id, Long parentId) {

		fields.setEnabled(internalRoleCD);
		fields.setRequired(internalRoleCD);
		fields.setConcreteValues(
				internalRoleCD,
				dictionaryProvider.getAll(InternalRole.class)
						.stream()
						.map(e -> new SimpleDictionary(e.key(), e.key(), true)).toList()
		);

		fields.setRequired(view);
		String role = (String) fields.get(internalRoleCD).getCurrentValue();
		if (role != null) {
			fields.setEnabled(view);
		}
		fields.setRequired(view);

		Set<String> unassignedViewsForRole = diffViewDBMeta(role);
		fields.setConcreteValues(view, unassignedViewsForRole
				.stream()
				.map(view -> new SimpleDictionary(view, view, true))
				.toList());
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<ResponsibilitiesAdminDTO> fields, InnerBcDescription bcDescription,
			Long parentId) {
		fields.enableFilter(internalRoleCD);
		fields.setConcreteFilterValues(
				internalRoleCD,
				dictionaryProvider.getAll(InternalRole.class)
						.stream()
						.map(e -> new SimpleDictionary(e.key(), e.key(), true)).toList()
		);
		fields.setForceActive(internalRoleCD);
		fields.enableSort(internalRoleCD);

		fields.enableFilter(view);
		fields.setConcreteFilterValues(
				view,
				metaAdminServiceExt.getAllViews()
						.stream()
						.map(view -> new SimpleDictionary(view.getName(), view.getName(), true))
						.toList()
		);
		fields.setForceActive(view);
		fields.enableSort(view);

		fields.enableFilter(viewWidgets);
		fields.setConcreteFilterValues(
				viewWidgets,
				metaAdminServiceExt.getAllWidgetsNameToDescription().entrySet()
						.stream()
						.map(entry -> new SimpleDictionary(entry.getKey(), entry.getValue(), true))
						.toList()
		);
	}

	private Set<String> diffViewDBMeta(@Nullable String role) {
		var viewsDB = getResponsibilityViews(role).stream().map(Responsibilities::getView).filter(Objects::nonNull)
				.collect(Collectors.toSet());
		var viewsMeta = metaAdminServiceExt.getAllViews().stream()
				.map(ViewSourceDTO::getName)
				.collect(Collectors.toSet());
		viewsMeta.removeAll(viewsDB);
		return viewsMeta;
	}

	public List<Responsibilities> getResponsibilityViews(@Nullable String role) {
		return jpaDao.getList(
				Responsibilities.class,
				(root, cq, cb) -> cb.and(
						cb.equal(root.get(Responsibilities_.responsibilityType), ResponsibilityType.VIEW),
						role != null ? cb.equal(root.get(Responsibilities_.internalRoleCD), role) : cb.and()
				)
		);
	}

}
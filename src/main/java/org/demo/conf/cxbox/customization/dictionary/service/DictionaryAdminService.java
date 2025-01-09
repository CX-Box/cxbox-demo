/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.demo.conf.cxbox.customization.dictionary.service;

import static org.demo.conf.cxbox.customization.dictionary.dto.DictionaryAdminDTO_.*;

import jakarta.persistence.EntityManager;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import org.cxbox.api.data.dictionary.DictionaryCache;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.api.service.LocaleService;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.BusinessError.Entity;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.exception.BusinessException;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.cxbox.core.file.service.CxboxFileService;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.core.api.TranslationId;
import org.cxbox.model.core.dao.JpaDao;
import org.cxbox.model.dictionary.entity.DictionaryItem;
import org.cxbox.model.dictionary.entity.DictionaryItemTranslation;
import org.cxbox.model.dictionary.entity.DictionaryItem_;
import org.cxbox.model.dictionary.entity.DictionaryTypeDesc;
import org.demo.conf.cxbox.customization.dictionary.dto.DictionaryAdminDTO;
import org.demo.util.CSVUtils;
import org.hibernate.exception.ConstraintViolationException;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S6813"})
@Service
public class DictionaryAdminService extends VersionAwareResponseService<DictionaryAdminDTO, DictionaryItem> {

	@Autowired
	private DictionaryCache dictionaryCache;

	@Autowired
	private JpaDao jpaDao;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private LocaleService localeService;

	@Autowired
	private CxboxFileService cxboxFileService;

	public DictionaryAdminService() {
		super(DictionaryAdminDTO.class, DictionaryItem.class, null, DictionaryAdminMeta.class);
	}

	@Override
	protected ActionResultDTO<DictionaryAdminDTO> doUpdateEntity(DictionaryItem entity, DictionaryAdminDTO data,
			BusinessComponent bc) {
		setIfChanged(data, type, entity::setType);
		if (data.isFieldChanged(dictionaryTypeId)) {
			entity.setDictionaryTypeId(data.getDictionaryTypeId() != null
					? entityManager.getReference(DictionaryTypeDesc.class, data.getDictionaryTypeId())
					: null);
		}
		setIfChanged(data, key, entity::setKey);
		if (data.isFieldChanged(value)) {
			entity.setValue(data.getValue());
			entity.getTranslations().forEach((lang, tr) -> tr.setValue(data.getValue()));
		}
		setIfChanged(data, active, entity::setActive);
		setIfChanged(data, displayOrder, entity::setDisplayOrder);
		setIfChanged(data, description, entity::setDescription);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	protected CreateResult<DictionaryAdminDTO> doCreateEntity(DictionaryItem entity, BusinessComponent bc) {
		entity.setActive(true);
		entity.setTranslations(localeService.getSupportedLanguages().stream().collect(Collectors.toMap(
				lang -> lang,
				lang -> new DictionaryItemTranslation(new TranslationId(lang), entity, null)
		)));
		jpaDao.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<DictionaryAdminDTO> updateEntity(BusinessComponent bc, DataResponseDTO data) {
		var result = super.updateEntity(bc, data);
		validate(bc, result);
		return result;
	}

	@Override
	public Actions<DictionaryAdminDTO> getActions() {
		return Actions.<DictionaryAdminDTO>builder()
				.create(crt -> crt.text("Create"))
				.save(sv -> sv.text("Save"))
				.cancelCreate(ccr -> ccr.text("Cancel"))
				.delete(dlt -> dlt.text("Delete"))
				.action(act -> act
						.action("clear_cache", "Clear Cache")
						.scope(ActionScope.BC)
						.invoker((bc, data) -> {
							// This will not work in cluster (>1 app nodes).
							// Please, add scheduler or other mechanism to clear cache in cluster
							dictionaryCache.reload();
							return new ActionResultDTO<>();
						}))
				.action(act -> act
						.action("export_liquibase", "Export")
						.scope(ActionScope.BC)
						.invoker((data, bc) -> new ActionResultDTO<DictionaryAdminDTO>()
								.setAction(PostAction.downloadFile(cxboxFileService.upload(toCsv(), null))))
				)
				.build();
	}

	private void validate(BusinessComponent bc, ActionResultDTO<DictionaryAdminDTO> result) {
		try {
			jpaDao.flush();
		} catch (DataIntegrityViolationException e) {
			if (e.getCause() instanceof ConstraintViolationException uniqEx) {
				if (DictionaryItem.CONSTRAINT_UNIQ_TYPE_KEY.equalsIgnoreCase(uniqEx.getConstraintName())) {
					throw new BusinessException(e).setEntity(new Entity(bc).addField(
							DictionaryItem_.key.getName(),
							"Key already exists for type " + result.getRecord().getType()
					));
				}
				if (DictionaryItem.CONSTRAINT_UNIQ_TYPE_VALUE.equalsIgnoreCase(uniqEx.getConstraintName())) {
					throw new BusinessException(e).setEntity(new Entity(bc).addField(
							DictionaryItem_.value.getName(),
							"Value already exists for type " + result.getRecord().getType()
					));
				}
			}
			throw e;
		}
	}

	@SneakyThrows
	@NotNull
	private FileDownloadDto toCsv() {
		String name = "DICTIONARY.csv";
		var header = List.of("TYPE", "KEY", "VALUE", "DISPLAY_ORDER", "DESCRIPTION", "ACTIVE", "ID");
		var body = jpaDao.getList(DictionaryItem.class).stream()
				.sorted(Comparator.comparing(DictionaryItem::getType)
						.thenComparing(dictionaryItem -> Optional.ofNullable(dictionaryItem.getDisplayOrder()).orElse(Integer.MAX_VALUE))
						.thenComparing(DictionaryItem::getValue)
						.thenComparing(DictionaryItem::getId)
				)
				.map(e -> List.of(
						Optional.ofNullable(e.getType()).orElse(""),
						Optional.ofNullable(e.getKey()).orElse(""),
						Optional.ofNullable(e.getValue()).orElse(""),
						Optional.ofNullable(e.getDisplayOrder()).map(d -> "" + d).orElse(""),
						Optional.ofNullable(e.getDescription()).orElse(""),
						e.isActive() ? "" : "false",
						""
				));
		return CSVUtils.toCsv(header, body, name, ";");
	}

}

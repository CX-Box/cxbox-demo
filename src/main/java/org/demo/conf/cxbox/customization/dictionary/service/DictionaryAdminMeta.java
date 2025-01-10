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

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import lombok.RequiredArgsConstructor;
import org.demo.conf.cxbox.customization.dictionary.dto.DictionaryAdminDTO;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DictionaryAdminMeta extends FieldMetaBuilder<DictionaryAdminDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DictionaryAdminDTO> fields, InnerBcDescription bcDescription,
			Long rowId, Long parRowId) {
		fields.setEnabled(
				type,
				dictionaryTypeId,
				key,
				value,
				active,
				displayOrder,
				description
		);

		fields.setRequired(type);
		fields.setRequired(key);
		fields.setRequired(value);
		fields.setRequired(active);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DictionaryAdminDTO> fields, InnerBcDescription bcDescription,
			Long parRowId) {
		fields.enableFilter(
				type,
				key,
				value,
				active,
				displayOrder,
				description
		);
		fields.enableSort(
				type,
				key,
				value,
				active,
				displayOrder,
				description
		);
	}

}

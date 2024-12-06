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

package org.demo.service.cxbox.inner.core;

import org.cxbox.core.crudma.bc.impl.InnerBcDescription;
import org.cxbox.core.dto.rowmeta.FieldsMeta;
import org.cxbox.core.dto.rowmeta.RowDependentFieldsMeta;
import org.cxbox.core.service.rowmeta.FieldMetaBuilder;
import lombok.RequiredArgsConstructor;
import org.demo.dto.cxbox.inner.DictionaryItemDTO;
import org.demo.dto.cxbox.inner.DictionaryItemDTO_;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DictionaryMeta extends FieldMetaBuilder<DictionaryItemDTO> {

	@Override
	public void buildRowDependentMeta(RowDependentFieldsMeta<DictionaryItemDTO> fields, InnerBcDescription bcDescription,
			Long rowId, Long parRowId) {
		fields.setEnabled(
				DictionaryItemDTO_.type,
				DictionaryItemDTO_.dictionaryTypeId,
				DictionaryItemDTO_.key,
				DictionaryItemDTO_.value,
				DictionaryItemDTO_.active,
				DictionaryItemDTO_.displayOrder,
				DictionaryItemDTO_.description
		);

		fields.setRequired(DictionaryItemDTO_.type);
		fields.setRequired(DictionaryItemDTO_.key);
		fields.setRequired(DictionaryItemDTO_.value);
		fields.setRequired(DictionaryItemDTO_.active);
	}

	@Override
	public void buildIndependentMeta(FieldsMeta<DictionaryItemDTO> fields, InnerBcDescription bcDescription,
			Long parRowId) {
		fields.enableFilter(
				DictionaryItemDTO_.type,
				DictionaryItemDTO_.key,
				DictionaryItemDTO_.value,
				DictionaryItemDTO_.active,
				DictionaryItemDTO_.displayOrder,
				DictionaryItemDTO_.description
		);
		fields.enableSort(
				DictionaryItemDTO_.type,
				DictionaryItemDTO_.key,
				DictionaryItemDTO_.value,
				DictionaryItemDTO_.active,
				DictionaryItemDTO_.displayOrder,
				DictionaryItemDTO_.description
		);
	}

}

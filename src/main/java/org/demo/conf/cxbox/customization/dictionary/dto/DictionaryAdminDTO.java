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

package org.demo.conf.cxbox.customization.dictionary.dto;

import java.util.Optional;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.BigDecimalValueProvider;
import org.cxbox.core.util.filter.provider.impl.BooleanValueProvider;
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.cxbox.model.core.entity.BaseEntity;
import org.cxbox.model.dictionary.entity.DictionaryItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DictionaryAdminDTO extends DataResponseDTO {

	@SearchParameter
	private String key;

	@SearchParameter
	private String value;

	@SearchParameter(provider = BooleanValueProvider.class)
	private Boolean active;

	@SearchParameter
	private String type;

	@SearchParameter(name = "dictionaryTypeId.id", provider = LongValueProvider.class)
	private Long dictionaryTypeId;

	@SearchParameter(provider = BigDecimalValueProvider.class)
	private Integer displayOrder;

	@SearchParameter
	private String description;

	public DictionaryAdminDTO(DictionaryItem dictionaryItem) {
		this.id = dictionaryItem.getId().toString();
		this.dictionaryTypeId = Optional.ofNullable(dictionaryItem.getDictionaryTypeId()).map(BaseEntity::getId).orElse(null);
		this.key = dictionaryItem.getKey();
		this.value = dictionaryItem.getValue();
		this.active = dictionaryItem.isActive();
		this.type = dictionaryItem.getType();
		this.displayOrder = dictionaryItem.getDisplayOrder();
		this.description = dictionaryItem.getDescription();
	}

}

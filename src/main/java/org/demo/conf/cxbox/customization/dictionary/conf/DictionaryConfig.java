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

package org.demo.conf.cxbox.customization.dictionary.conf;

import java.util.Collection;
import lombok.NonNull;
import org.cxbox.api.data.dictionary.DictionaryCache;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.dictionary.Dictionary;
import org.cxbox.dictionary.DictionaryProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DictionaryConfig {

	@Bean
	public DictionaryProvider dictionaryProvider() {
		return new DictionaryProvider() {

			@Override
			public <T extends Dictionary> T lookupName(@NonNull Class<T> type, @NonNull DictionaryValue value) {
				var dictTmp = Dictionary.of(type, "");
				var lov = DictionaryCache.dictionary().lookupName(value.getValue(), dictTmp.getDictionaryType());
				return Dictionary.of(type, lov.getKey());
			}

			@Override
			public <T extends Dictionary> SimpleDictionary lookupValue(@NonNull T dictionary) {
				return DictionaryCache.dictionary().get(dictionary.getDictionaryType(), dictionary.key());
			}

			@Override
			public <T extends Dictionary> Collection<T> getAll(@NonNull Class<T> dictionaryType) {
				return DictionaryCache.dictionary().getAll(Dictionary.of(dictionaryType, "").getDictionaryType())
						.stream()
						.map(e -> Dictionary.of(dictionaryType, e.getKey()))
						.toList();
			}
		};
	}

}

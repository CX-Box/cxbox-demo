package org.demo.conf.cxbox.extension.lov;

import static org.cxbox.api.data.dictionary.DictionaryCache.dictionary;

import java.io.Serializable;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.data.dictionary.IDictionaryType;
import org.cxbox.api.data.dictionary.LOV;

@Getter
@RequiredArgsConstructor
public enum AdministeredDictionaryType implements Serializable, IDictionaryType {

	INTERNAL_ROLE;

	@Override
	public LOV lookupName(String val) {
		return dictionary().lookupName(val, this);
	}

	@Override
	public String lookupValue(LOV lov) {
		return dictionary().lookupValue(lov, this);
	}

	@Override
	public String getName() {
		return name();
	}

	public boolean containsKey(String key) {
		return dictionary().containsKey(key, this);
	}

}
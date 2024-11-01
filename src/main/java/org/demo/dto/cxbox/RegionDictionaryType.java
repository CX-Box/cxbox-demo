package org.demo.dto.cxbox;

import static org.cxbox.api.data.dictionary.DictionaryCache.dictionary;

import java.io.Serializable;
import org.cxbox.api.data.dictionary.IDictionaryType;
import org.cxbox.api.data.dictionary.LOV;

public enum RegionDictionaryType implements Serializable, IDictionaryType {
	REGIONS;

	@Override
	public String getName() {
		return name();
	}

	@Override
	public LOV lookupName(String val) {
		return dictionary().lookupName(val, this);
	}

	@Override
	public String lookupValue(LOV lov) {
		return dictionary().lookupValue(lov, this);
	}

	public boolean containsKey(String key) {
		return dictionary().containsKey(key, this);
	}

}

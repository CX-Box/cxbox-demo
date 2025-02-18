package org.demo.entity.dictionary;

import org.cxbox.dictionary.Dictionary;

public record Product(String key) implements Dictionary {
	public static final Product EXPERTISE = new Product("EXPERTISE");

}

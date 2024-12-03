package org.demo.entity.dictionary;

import org.cxbox.dictionary.Dictionary;

public record Briefings(String key) implements Dictionary {

	public static final Briefings PROJECT = new Briefings("PROJECT");

	public static final Briefings SECURITY = new Briefings("SECURITY");

}

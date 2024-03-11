package org.demo.conf.cxbox.extension.lov;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import org.cxbox.api.data.dictionary.BaseLov;

@Target(FIELD)
@Retention(RUNTIME)
@BaseLov(type = AdministeredDictionaryType.class)
public @interface AdministeredDictionary {

	AdministeredDictionaryType value();

}

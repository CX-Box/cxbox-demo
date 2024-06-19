package org.demo.dto.cxbox;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import org.cxbox.api.data.dictionary.BaseLov;

@Target(FIELD)
@Retention(RUNTIME)
@BaseLov(type = TestDictionaryType.class)
public @interface TestDictionary {

	TestDictionaryType value();
}

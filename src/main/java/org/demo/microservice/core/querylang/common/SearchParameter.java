package org.demo.microservice.core.querylang.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.demo.microservice.core.querylang.common.filterMapper.AutoMapper;

/**
 * Enables filtration by the annotated field.
 * Configures the rules and parameters for filtering by field.
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SearchParameter {

	/**
	 * A path to the field on a JPA entity on which filtering will be performed.
	 * For collections annotated with {@link jakarta.persistence.ElementCollection ElementCollection}
	 * provide a path to the collection field itself.
	 * For collections annotated with {@link jakarta.persistence.OneToMany OneToMany}
	 * provide a path to the association entity field.
	 *
	 * @return Dot notation path e.g. entityField.associationField.
	 */
	String name() default "";

	/**
	 * Get a provider for defining of classify data parameter in sorting or searching cases.
	 * Necessary to correctly type string representation of filtering parameter.
	 *
	 * @return ClassifyDataProvider
	 */
	Class<? extends DtoToEntityFilterParameterMapper> provider() default AutoMapper.class;

}

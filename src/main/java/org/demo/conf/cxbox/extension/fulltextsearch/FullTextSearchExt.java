package org.demo.conf.cxbox.extension.fulltextsearch;

import java.util.Optional;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import lombok.NonNull;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.core.crudma.bc.BusinessComponent;

@UtilityClass
public class FullTextSearchExt {

	/**
	 * Retrieves the value of the "_fullTextSearch" filter parameter from the given BusinessComponent and
	 * creates a Specification that is a conjunction of FullTextSearch specification and original specification.
	 *
	 * @param bc The BusinessComponent from which to retrieve the filter parameter.
	 * @return An Optional<Specification<Client>> object containing the new Specification. If the "_fullTextSearch"
	 *         parameter is not found, original Specification is returned.
	 * <p>
	 * Usage:
	 * <pre>
	 * {@code
	 * @Override
	 *     protected Specification<Client> getSpecification(BusinessComponent bc) {
	 *         var fullTextSearchFilterParam = FullTextSearchExt.getFullTextSearchFilterParam(bc);
	 *         var specification = super.getSpecification(bc);
	 *         return fullTextSearchFilterParam.map(e -> and(clientRepository.getFullTextSearchSpecification(e), specification)).orElse(specification);
	 *     }
	 * }
	 * </pre>
	 */
	@NonNull
	public static Optional<String> getFullTextSearchFilterParam(BusinessComponent bc) {
		return Optional.ofNullable(bc.getParameters().getParameter("_fullTextSearch"));
	}

	public static Predicate likeIgnoreCase(String value, CriteriaBuilder cb, Path<String> path) {
		return cb.like(cb.lower(path), StringUtils.lowerCase("%" + value + "%"));
	}

}

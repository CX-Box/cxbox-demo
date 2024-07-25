package org.demo.repository;

import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.entity.Contact;
import org.demo.entity.Contact_;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long>, JpaSpecificationExecutor<Contact> {


	default Specification<Contact> getFullTextSearchSpecification(String value) {
		return getFullNameLikeIgnoreCaseSpecification(value)
				.or(getPhoneNumberLikeIgnoreCaseSpecification(value))
				.or(getEmailLikeIgnoreCaseSpecification(value));
	}

	default Specification<Contact> getFullNameLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) -> FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Contact_.fullName));
	}


	default Specification<Contact> getPhoneNumberLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) -> FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Contact_.phoneNumber));
	}

	default Specification<Contact> getEmailLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) ->  FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Contact_.email));
	}

}

package org.demo.repository;

import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.entity.Client;
import org.demo.entity.Client_;
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

	default Specification<Contact> getAllContactsNotAlreadyAssociatedWithClient(Long clientId) {
		return (root, cq, cb) -> {
			var sub = cq.subquery(Long.class);
			var client = sub.from(Client.class);
			sub.select(client.join(Client_.contacts).get(BaseEntity_.id))
					.where(cb.equal(client.get(BaseEntity_.id), clientId));
			return cb.not(root.get(BaseEntity_.id).in(sub));
		};
	}

	default Specification<Contact> getAllClientContacts(Long clientId) {
		return (root, cq, cb) -> {
			cq.distinct(true);
			return cb.literal(clientId).in(root.join(Contact_.clients).get(BaseEntity_.id));
		};
	}

}

package org.demo.repository;

import jakarta.persistence.criteria.Join;
import java.util.List;
import java.util.Set;
import org.demo.entity.Client;
import org.demo.entity.Client_;
import org.demo.entity.enums.ClientStatus;
import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {

	default Specification<Client> getFullTextSearchSpecification(String value) {
		return getAddressLikeIgnoreCaseSpecification(value)
				.or(getFullNameLikeIgnoreCaseSpecification(value));
	}

	default Specification<Client> getFullNameLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) -> FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Client_.fullName));
	}


	default Specification<Client> getAddressLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) -> FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Client_.address));
	}

	default Specification<Client> statusIn(List<ClientStatus> clientStatusList) {
		return (root, query, cb) -> root.get(Client_.status).in(clientStatusList);
	}

	default Specification<Client> findAllByFieldOfActivities(Set<FieldOfActivity> fieldOfActivities) {
		return (root, query, cb) -> {
			if (fieldOfActivities == null || fieldOfActivities.isEmpty()) {
				return cb.conjunction();
			}
			Join<Client, FieldOfActivity> join = root.join(Client_.fieldOfActivities);
			query.distinct(true);
			return join.in(fieldOfActivities);
		};
	}

	List<Client> findAllByFieldOfActivitiesInAndStatusIn(Set<FieldOfActivity> fieldOfActivities, List<ClientStatus> status);

	List<Client> findAllByFieldOfActivitiesIn(Set<FieldOfActivity> fieldOfActivities);

}

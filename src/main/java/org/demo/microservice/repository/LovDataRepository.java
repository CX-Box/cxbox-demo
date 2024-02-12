package org.demo.microservice.repository;

import static org.demo.entity.ListOfValues_.parents;
import static org.demo.entity.LovHierarchy_.parentLov;

import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.core.querylang.springdata.core.QueryLanguageRepository;
import org.demo.microservice.entity.ListOfValues;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LovDataRepository extends JpaRepository<ListOfValues, Long>, JpaSpecificationExecutor<ListOfValues>,
		QueryLanguageRepository<ListOfValues, Long> {

	static Specification<ListOfValues> byParentId(final Long parentId) {
		return Specification.where((root, cq, cb) -> cb.equal(
				root.join(parents).get(parentLov).get(BaseEntity_.id),
				parentId
		));
	}

}

package org.demo.microservice.repository;


import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.microservice.core.querylang.springdata.core.QueryLanguageRepository;
import org.demo.microservice.entity.ListOfValues;
import org.demo.microservice.entity.ListOfValues_;
import org.demo.microservice.entity.LovHierarchy_;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LovDataRepository extends JpaRepository<ListOfValues, Long>, JpaSpecificationExecutor<ListOfValues>,
		QueryLanguageRepository<ListOfValues, Long> {

	static Specification<ListOfValues> byParentId(final Long parentId) {
		return Specification.where((root, cq, cb) -> cb.equal(
				root.join(ListOfValues_.parents).get(LovHierarchy_.parentLov).get(BaseEntity_.id),
				parentId
		));
	}

}

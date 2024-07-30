package org.demo.microservice.repository;

import org.demo.microservice.core.querylang.springdata.core.QueryLanguageRepository;
import org.demo.microservice.entity.LovHierarchy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LovHierarchyRepository extends JpaRepository<LovHierarchy, Long>,
		JpaSpecificationExecutor<LovHierarchy>,
		QueryLanguageRepository<LovHierarchy, Long> {

	void deleteAllByParentLov_Id(final Long id);

	void deleteAllByParentLov_IdAndChildLov_Id(final Long parentId, final Long childId);

}
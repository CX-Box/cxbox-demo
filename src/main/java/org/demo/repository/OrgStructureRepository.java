package org.demo.repository;

import org.demo.entity.OrgStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OrgStructureRepository extends JpaRepository<OrgStructure, Long>,
		JpaSpecificationExecutor<OrgStructure> {

}

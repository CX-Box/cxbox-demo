package org.demo.repository;

import org.cxbox.meta.entity.Responsibilities;

import org.cxbox.meta.entity.Responsibilities.ResponsibilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ResponsibilitiesRepository extends JpaRepository<Responsibilities, Long>, JpaSpecificationExecutor<Responsibilities> {

	Long countByInternalRoleCDAndViewAndResponsibilityTypeAndIdNot(String internalRoleCD, String view,
			ResponsibilityType responsibilityType, Long id);

}

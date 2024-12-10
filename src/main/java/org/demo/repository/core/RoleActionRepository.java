package org.demo.repository.core;

import org.demo.entity.core.RoleAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleActionRepository extends JpaRepository<RoleAction, Long>, JpaSpecificationExecutor<RoleAction> {

}


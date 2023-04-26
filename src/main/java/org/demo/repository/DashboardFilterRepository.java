package org.demo.repository;

import org.demo.entity.DashboardFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardFilterRepository extends JpaRepository<DashboardFilter, Long>, JpaSpecificationExecutor<DashboardFilter> {

}

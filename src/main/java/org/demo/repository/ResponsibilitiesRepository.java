package org.demo.repository;

import org.cxbox.meta.entity.Responsibilities;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ResponsibilitiesRepository extends JpaRepository<Responsibilities, Long>, JpaSpecificationExecutor<Responsibilities> {

}

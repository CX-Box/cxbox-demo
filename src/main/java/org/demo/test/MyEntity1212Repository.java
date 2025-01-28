package org.demo.test;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MyEntity1212Repository extends JpaRepository<MyEntity1212, Long>,
		JpaSpecificationExecutor<MyEntity1212> {

}

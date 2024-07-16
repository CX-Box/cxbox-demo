package org.demo.testforilia.bc4;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MyEntity1225Repository extends JpaRepository<MyEntity1225, Long>,
		JpaSpecificationExecutor<MyEntity1225> {

}

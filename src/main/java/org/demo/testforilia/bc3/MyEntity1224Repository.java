package org.demo.testforilia.bc3;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MyEntity1224Repository extends JpaRepository<MyEntity1224, Long>,
		JpaSpecificationExecutor<MyEntity1224> {

}

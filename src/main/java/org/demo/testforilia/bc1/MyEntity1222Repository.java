package org.demo.testforilia.bc1;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MyEntity1222Repository extends JpaRepository<MyEntity1222, Long>,
		JpaSpecificationExecutor<MyEntity1222> {

}

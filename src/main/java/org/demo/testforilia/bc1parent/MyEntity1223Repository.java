package org.demo.testforilia.bc1parent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MyEntity1223Repository extends JpaRepository<MyEntity1223, Long>,
		JpaSpecificationExecutor<MyEntity1223> {

}

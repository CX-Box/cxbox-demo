package org.demo.repository;

import java.util.List;
import org.demo.entity.MatrixItem;
import org.demo.entity.MatrixItem_;
import org.demo.entity.Sale;
import org.cxbox.model.core.entity.Department;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>, JpaSpecificationExecutor<Department> {



}

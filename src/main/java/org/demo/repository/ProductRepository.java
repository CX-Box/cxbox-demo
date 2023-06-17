package org.demo.repository;

import java.util.List;
import org.demo.entity.MatrixItem_;
import org.demo.entity.Product;
import org.demo.entity.Sale;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

	List<Product> findAllBySiebelIdIn(Iterable<String> siebelIds);

	static Specification<Product> byIdIn(List<Long> ids) {
		return (root, query, builder) -> root.get(MatrixItem_.id).in(ids);
	}
}

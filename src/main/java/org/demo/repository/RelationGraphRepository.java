package org.demo.repository;

import org.demo.entity.RelationGraph;
import org.demo.entity.RelationGraph_;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RelationGraphRepository extends JpaRepository<RelationGraph, Long>, JpaSpecificationExecutor<RelationGraph> {


	default Specification<RelationGraph> findByClient(Long id) {
		return (root, query, criteriaBuilder) ->
				criteriaBuilder.equal(root.get(RelationGraph_.rootClientId), id);
	}

}

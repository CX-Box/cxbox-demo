package org.demo.repository;

import java.util.List;
import java.util.Optional;
import org.demo.entity.Client;
import org.demo.repository.projection.RelationGraphPrj;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListPagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RelationSaleRepository extends ListPagingAndSortingRepository<Client, Long> {

	@Query(nativeQuery = true, value = """
			WITH RECURSIVE graph(node) AS (
				/* Step 1: Start from the selected targetId. */
				SELECT CAST(:targetId AS numeric(19,0))
			
				UNION
			
				/* Step 2:  Recursively  all targetId children and parents*/
				SELECT
					CASE
						WHEN s.client_seller_id = g.node THEN s.client_id
						ELSE s.client_seller_id
					END AS node
				FROM graph g
				JOIN sale s
				ON
					s.client_seller_id = g.node /* find all targetId children */
					OR
					s.client_id = g.node /* find all targetId parents */
				WHERE s.client_seller_id IS NOT NULL
					AND s.client_id IS NOT NULL
					AND s.client_seller_id <> s.client_id /*exclude graph cycle - not supported in UI */
			)
			/* Step 3: found graph edges by sourceId and targetId and add total sum */
			SELECT
				CAST(s.client_seller_id AS BIGINT)  AS sourceId,
				CAST(s.client_id AS BIGINT)         AS targetId,
				CAST(SUM(s.sum) AS BIGINT)          AS sum
			FROM sale s
			JOIN graph gs ON gs.node = s.client_seller_id
			JOIN graph gc ON gc.node = s.client_id
			GROUP BY sourceId, targetId;
			""")
	List<RelationGraphPrj> findAllRelatedClientForGraph(
			@Param("targetId") long targetId
	);
}

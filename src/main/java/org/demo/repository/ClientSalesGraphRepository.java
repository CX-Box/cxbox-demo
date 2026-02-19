package org.demo.repository;

import java.util.List;
import org.demo.entity.Client;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgePrj;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListPagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientSalesGraphRepository extends ListPagingAndSortingRepository<Client, Long> {

	@SuppressWarnings({"java:S2479"})
	@Query(nativeQuery = true, value = """
			WITH RECURSIVE graph(node) AS (
				/* Step 1: Start from the selected parentId. */
				SELECT CAST(:parentId AS numeric(19,0))
				UNION
				/* Step 2: Recursively add all parentId children and parents*/
				SELECT
					CASE
						WHEN s.client_seller_id = g.node THEN s.client_id
						ELSE s.client_seller_id
					END AS node
				FROM graph g
				JOIN sale s
				ON
					s.client_seller_id = g.node /* Find all parentId children */
					OR
					s.client_id = g.node 				/* Find all parentId parents */
				WHERE s.client_seller_id IS NOT NULL
					AND s.client_id IS NOT NULL
					AND s.client_seller_id <> s.client_id /* Exclude oriented graph cycle - not supported in UI */
			)
			/* Step 3: Found graph edges by sourceId and targetId and add total sum */
			SELECT
				CAST(s.client_seller_id AS BIGINT)  AS sourceNodeId,
				CAST(s.client_id AS BIGINT)         AS targetNodeId,
				CAST(SUM(s.sum) AS BIGINT)          AS value
			FROM sale s
			JOIN graph gs ON gs.node = s.client_seller_id
			JOIN graph gc ON gc.node = s.client_id
			GROUP BY sourceNodeId, targetNodeId;
			""")
	List<GraphEdgePrj> findGraphEdges(@Param("parentId") long parentId);
}

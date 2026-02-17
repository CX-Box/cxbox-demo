package org.demo.service.cxbox.anysource.relationSale;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.demo.entity.enums.TargetNodeType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RelationGraphJdbcDao {

	private final NamedParameterJdbcTemplate jdbc;

	public List<Row> loadGraph(long targetClientId) {
		var sql = """
				WITH RECURSIVE
							params AS (
						SELECT :target_client_id::bigint AS target_id
							),
							dir_edges AS (
								SELECT DISTINCT
										s.client_seller_id::bigint AS source_id,
										s.client_id::bigint        AS target_id
								FROM sale s
								WHERE s.client_seller_id IS NOT NULL
								AND s.client_id IS NOT NULL
									AND (s.client_seller_id::bigint <> s.client_id::bigint)
							),
							bi_edges AS (
								SELECT source_id AS from_id, target_id AS to_id FROM dir_edges
								UNION ALL
								SELECT target_id AS from_id, source_id AS to_id FROM dir_edges
							),
							reach AS (
								SELECT
									p.target_id AS node_id,
									0           AS depth,
									ARRAY[p.target_id] AS path
								FROM params p
								UNION ALL
								SELECT
									e.to_id     AS node_id,
									r.depth + 1 AS depth,
									r.path || e.to_id AS path
								FROM reach r
								JOIN bi_edges e
									ON e.from_id = r.node_id
								WHERE r.depth < 200
									AND NOT (e.to_id = ANY(r.path))
							),
							component_nodes AS (
								SELECT node_id, MIN(depth) AS min_depth
								FROM reach
								GROUP BY node_id
							),
							graph_edges AS (
								SELECT DISTINCT
									de.source_id,
									de.target_id
						FROM dir_edges de
								JOIN component_nodes s ON s.node_id = de.source_id
								JOIN component_nodes t ON t.node_id = de.target_id
								WHERE de.source_id <> de.target_id
							),
							indegree AS (
								SELECT
									n.node_id,
									COUNT(ge.target_id) AS indeg
								FROM component_nodes n
								LEFT JOIN graph_edges ge
									ON ge.target_id = n.node_id
								GROUP BY n.node_id
							),
							first_nodes AS (
								SELECT node_id
								FROM indegree
								WHERE indeg = 0
							),
							pair_metrics AS (
								SELECT
										LEAST(s.client_seller_id::bigint, s.client_id::bigint)     AS a_id,
										GREATEST(s.client_seller_id::bigint, s.client_id::bigint)  AS b_id,
										SUM(s.sum)::bigint                                         AS edge_value
								FROM sale s
								WHERE s.client_seller_id IS NOT NULL
									AND s.client_id IS NOT NULL
									AND (s.client_seller_id::bigint <> s.client_id::bigint)
								GROUP BY 1, 2
							),
			
							base_edges AS (
								SELECT
									concat(ge.target_id::text, '_', ge.source_id::text)        AS id,
									(SELECT target_id FROM params)                             AS root_client_id,
										ge.source_id::text                                         AS source_node_id,
									ge.target_id::text                                         AS target_node_id,
				
									CASE WHEN ge.target_id = (SELECT target_id FROM params) THEN 'main' END AS target_node_type,
									(cn_t.min_depth <= 2)                                      AS target_node_expanded,
				
									src.full_name                                              AS source_node_name,
									src.address                                                AS source_node_description,
									tgt.full_name                                              AS target_node_name,
									tgt.address                                                AS target_node_description,
				
										COALESCE(pm.edge_value, 0)::bigint                         AS edge_value,
										0                                                          AS vstamp,
										GREATEST(src.created_date, tgt.created_date)               AS created_date,
										GREATEST(src.updated_date, tgt.updated_date)               AS updated_date,
										1                                                          AS created_by_user_id,
										1                                                          AS last_upd_by_user_id
								FROM graph_edges ge
								LEFT JOIN component_nodes cn_t ON cn_t.node_id = ge.target_id
								LEFT JOIN client src ON src.id = ge.source_id
								LEFT JOIN client tgt ON tgt.id = ge.target_id
								LEFT JOIN pair_metrics pm
								ON pm.a_id = LEAST(ge.source_id, ge.target_id)
									AND pm.b_id = GREATEST(ge.source_id, ge.target_id)
							),
							vroot_nodes AS (
								SELECT
										concat(fn.node_id::text, '_', fn.node_id::text)            AS id,
										(SELECT target_id FROM params)                             AS root_client_id,
										NULL::text                                                 AS source_node_id,
										fn.node_id::text                                           AS target_node_id,
				
									CASE WHEN fn.node_id = (SELECT target_id FROM params) THEN 'main' END AS target_node_type,
									true                                                       AS target_node_expanded,
				
									NULL::text                                                 AS source_node_name,
									NULL::text                                                 AS source_node_description,
									c.full_name                                                AS target_node_name,
									c.address                                                  AS target_node_description,
				
									0::bigint                                                  AS edge_value,
									0                                                          AS vstamp,
									c.created_date                                             AS created_date,
									c.updated_date                                             AS updated_date,
									1                                                          AS created_by_user_id,
									1                                                          AS last_upd_by_user_id
								FROM first_nodes fn
								LEFT JOIN client c ON c.id = fn.node_id
							),
							all_rows AS (
								SELECT * FROM base_edges
								UNION ALL
								SELECT * FROM vroot_nodes
							),
							result AS (
								SELECT
									r.*,
									CASE
										WHEN r.edge_value > 0
										AND r.edge_value = MIN(r.edge_value) FILTER (WHERE edge_value > 0) OVER ()
										THEN '#DD0A34'
										ELSE NULL
									END AS color
								FROM all_rows r
							)
							SELECT *
							FROM result
							ORDER BY source_node_id, target_node_id;
				""";

		var params = new MapSqlParameterSource("target_client_id", targetClientId);

		return jdbc.query(
				sql, params, (rs, i) -> new Row(
						rs.getString("id"),
						rs.getLong("root_client_id"),
						rs.getString("source_node_id"),
						rs.getString("target_node_id"),
						rs.getString("target_node_name"),
						rs.getBoolean("target_node_expanded"),
						rs.getString("target_node_description"),
						rs.getLong("edge_value"),
						rs.getInt("vstamp"),
						rs.getObject("created_date", LocalDateTime.class),
						rs.getObject("updated_date", LocalDateTime.class),
						rs.getLong("created_by_user_id"),
						rs.getLong("last_upd_by_user_id"),
						rs.getString("color"),
						TargetNodeType.fromValue(rs.getString("target_node_type"))
				)
		);
	}

	public record Row(
			String id,
			long rootClientId,
			String sourceNodeId,
			String targetNodeId,
			String targetNodeName,
			boolean targetNodeExpanded,
			String targetNodeDescription,
			long edgeValue,
			int vstamp,
			LocalDateTime createdDate,
			LocalDateTime updatedDate,
			long createdByUserId,
			long lastUpdByUserId,
			String color,
			TargetNodeType targetNodeType
	) {

	}

}

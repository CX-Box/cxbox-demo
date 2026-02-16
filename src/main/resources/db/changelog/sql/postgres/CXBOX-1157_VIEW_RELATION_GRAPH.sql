DROP VIEW IF EXISTS v_relation_graph;
CREATE OR REPLACE VIEW v_relation_graph AS
WITH RECURSIVE

-- seller -> buyer directed edges
dir_edges AS (SELECT DISTINCT s.client_seller_id::bigint AS seller_id,
                              s.client_id::bigint        AS buyer_id
              FROM sale s
              WHERE s.client_seller_id IS NOT NULL
                AND s.client_id IS NOT NULL
                AND s.client_seller_id <> s.client_id),

-- all clients present in sales (both buyer and seller)
all_selected AS (SELECT DISTINCT x.client_id AS selected_id
                 FROM (SELECT s.client_id::bigint AS client_id
                       FROM sale s
                       UNION
                       SELECT s.client_seller_id::bigint AS client_id
                       FROM sale s) x),

-- nodes that have incoming edges (buyers)
incoming AS (SELECT DISTINCT buyer_id AS id FROM dir_edges),
-- nodes that have outgoing edges (sellers)
outgoing AS (SELECT DISTINCT seller_id AS id FROM dir_edges),

-- walk "up" from selected: buyer -> seller (collect ancestors)
up_walk AS (SELECT s.selected_id,
                   s.selected_id AS cur_id,
                   0             AS depth
            FROM all_selected s

            UNION
            SELECT u.selected_id,
                   de.seller_id AS cur_id,
                   u.depth + 1
            FROM up_walk u
                     JOIN dir_edges de
                          ON de.buyer_id = u.cur_id
            WHERE u.depth < 200),

-- unique ancestor set per selected
ancestors AS (SELECT DISTINCT selected_id, cur_id AS node_id
              FROM up_walk),

-- pick per-selected root: farthest ancestor that is a source-only seller; fallback to min ancestor id
component_roots AS (SELECT s.selected_id,
                           COALESCE(best.root_id, fallback.min_ancestor_id) AS graph_root_id
                    FROM (SELECT DISTINCT selected_id FROM all_selected) s

                             LEFT JOIN LATERAL (
                        SELECT DISTINCT ON (u.selected_id) u.selected_id,
                                                           u.cur_id AS root_id
                        FROM up_walk u
                        WHERE u.selected_id = s.selected_id
                          AND u.cur_id IN (SELECT id FROM outgoing)
                          AND u.cur_id NOT IN (SELECT id FROM incoming)
                        ORDER BY u.selected_id, u.depth DESC, u.cur_id ASC
                        ) best ON true

                             LEFT JOIN LATERAL (
                        SELECT MIN(a.node_id) AS min_ancestor_id
                        FROM ancestors a
                        WHERE a.selected_id = s.selected_id
                        ) fallback ON true),

-- walk "down" from chosen root: seller -> buyer
walk AS (SELECT cr.selected_id,
                cr.graph_root_id AS cur_id,
                0                AS depth
         FROM component_roots cr

         UNION
         SELECT w.selected_id,
                de.buyer_id AS cur_id,
                w.depth + 1 AS depth
         FROM walk w
                  JOIN dir_edges de
                       ON de.seller_id = w.cur_id
         WHERE w.depth < 200),

-- minimal depth for each node per selected root
min_depth AS (SELECT selected_id, cur_id, MIN(depth) AS depth
              FROM walk
              GROUP BY selected_id, cur_id),

-- canonical parent pointers: parent must be at depth-1 and have an edge parent->child
canon AS (
    -- root
    SELECT md.selected_id,
           md.cur_id,
           NULL::bigint AS parent_id,
           0            AS depth
    FROM min_depth md
             JOIN component_roots cr
                  ON cr.selected_id = md.selected_id
                      AND cr.graph_root_id = md.cur_id
                      AND md.depth = 0

    UNION ALL

    -- other nodes
    SELECT *
    FROM (SELECT DISTINCT ON (c.selected_id, c.cur_id) c.selected_id,
                                                       c.cur_id,
                                                       p.cur_id AS parent_id,
                                                       c.depth
          FROM min_depth c
                   JOIN min_depth p
                        ON p.selected_id = c.selected_id
                            AND p.depth = c.depth - 1
                   JOIN dir_edges de
                        ON de.seller_id = p.cur_id
                            AND de.buyer_id = c.cur_id
          WHERE c.depth > 0
          ORDER BY c.selected_id, c.cur_id, parent_id ASC) t),

-- final edges (including the root row where source_id is NULL)
final_edges AS (SELECT c.selected_id,
                       c.parent_id AS source_id,
                       c.cur_id    AS target_id,
                       c.depth
                FROM canon c),

-- sum metric for undirected client pair (used as edge weight)
pair_metrics AS (SELECT LEAST(s.client_seller_id, s.client_id)::bigint    AS a_id,
                        GREATEST(s.client_seller_id, s.client_id)::bigint AS b_id,
                        SUM(s.sum)::bigint                                AS edge_value
                 FROM sale s
                 WHERE s.client_seller_id IS NOT NULL
                   AND s.client_id IS NOT NULL
                   AND s.client_seller_id <> s.client_id
                 GROUP BY LEAST(s.client_seller_id, s.client_id),
                          GREATEST(s.client_seller_id, s.client_id))

SELECT
       target_id                                                          AS id,
       e.selected_id                                                      AS root_client_id,
       e.source_id::text                                                  AS source_node_id,
       e.target_id::text                                                  AS target_node_id,
       tgt.full_name                                                      AS target_node_name,
       (e.depth IN (0, 1))                                                AS target_node_expanded,
       tgt.address                                                        AS target_node_description,
       tgt.importance                                                     AS target_importance,
       COALESCE(pm.edge_value, 0)::bigint                                 AS edge_value,
       e.target_id                                                        AS target_client_id,
       0                                                                  AS vstamp,
       tgt.created_date                                                   AS created_date,
       tgt.updated_date                                                   AS updated_date,
       1                                                                  AS created_by_user_id,
       1                                                                  AS last_upd_by_user_id

FROM final_edges e
         LEFT JOIN client tgt
                   ON tgt.id = e.target_id
         LEFT JOIN pair_metrics pm
                   ON pm.a_id = LEAST(COALESCE(e.source_id, e.target_id), e.target_id)
                       AND pm.b_id = GREATEST(COALESCE(e.source_id, e.target_id), e.target_id)

ORDER BY e.selected_id, e.depth, e.source_id NULLS FIRST, e.target_id;

DROP VIEW IF EXISTS V_RELATION_GRAPH;
-- CREATE OR REPLACE VIEW V_RELATION_GRAPH AS
-- WITH RECURSIVE
--     edges_base AS (
--         SELECT
--             s.CLIENT_SELLER_ID AS SELLER_ID,
--             s.CLIENT_ID AS CLIENT_ID,
--             SUM(s.SUM) AS total_sum,
--             COUNT(DISTINCT s.ID) AS tx_count,
--             MIN(s.CREATED_DATE) AS first_date,
--             MAX(s.CREATED_DATE) AS last_date
--         FROM SALE s
--         GROUP BY s.CLIENT_SELLER_ID, s.CLIENT_ID
--     ),
--
--     all_sellers AS (
--         SELECT DISTINCT SELLER_ID FROM edges_base
--     ),
--
--     org_hierarchy AS (
--         SELECT
--             e.SELLER_ID AS edge_seller_id,
--             e.CLIENT_ID AS edge_client_id,
--             s.SELLER_ID AS root_seller_id,
--             1 AS depth,
--             CAST('|' || CAST(e.SELLER_ID AS VARCHAR(20)) || '|' || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|' AS VARCHAR(4000)) AS visited_path,
--             e.total_sum,
--             e.tx_count,
--             e.first_date,
--             e.last_date
--         FROM edges_base e
--                  INNER JOIN all_sellers s ON e.SELLER_ID = s.SELLER_ID
--
--         UNION ALL
--
--         SELECT
--             e.SELLER_ID AS edge_seller_id,
--             e.CLIENT_ID AS edge_client_id,
--             oh.root_seller_id,
--             oh.depth + 1 AS depth,
--             CAST(oh.visited_path || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|' AS VARCHAR(4000)) AS visited_path,
--             e.total_sum,
--             e.tx_count,
--             e.first_date,
--             e.last_date
--         FROM org_hierarchy oh
--                  INNER JOIN edges_base e ON e.SELLER_ID = oh.edge_client_id
--         WHERE oh.depth < 20
--           AND oh.visited_path NOT LIKE '%|' || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|%'
--     ),
--
--     -- Deduplicate: keep only shortest path for each unique edge (seller->client)
--     dedup_edges AS (
--         SELECT
--             edge_seller_id,
--             edge_client_id,
--             MIN(root_seller_id) AS root_seller_id,
--             MIN(visited_path) AS visited_path,
--             SUM(total_sum) AS total_sum,
--             SUM(tx_count) AS tx_count,
--             MIN(depth) AS depth,
--             MIN(first_date) AS first_date,
--             MAX(last_date) AS last_date,
--             ROW_NUMBER() OVER (PARTITION BY edge_seller_id, edge_client_id ORDER BY MIN(depth), MIN(LENGTH(visited_path))) AS rn
--         FROM org_hierarchy
--         GROUP BY edge_seller_id, edge_client_id
--     )
-- SELECT
--             ROW_NUMBER() OVER (ORDER BY depth, edge_seller_id, edge_client_id) AS id,
--             root_seller_id,
--             CAST(edge_seller_id AS BIGINT) AS seller_id,
--             CAST(edge_client_id AS BIGINT) AS client_id,
--             visited_path AS all_nodes,
--             CAST(total_sum AS BIGINT) AS total_amount,
--             CAST(tx_count AS BIGINT) AS transaction_count,
--             CAST(depth AS BIGINT) AS depth,
--             CAST(0 AS BIGINT) AS is_cyclic,
--             -1 AS vstamp,
--             first_date AS created_date,
--             last_date AS updated_date,
--             1 AS created_by_user_id,
--             1 AS last_upd_by_user_id
-- FROM dedup_edges
-- WHERE rn = 1
-- ORDER BY depth, edge_seller_id, edge_client_id;
--
-- DROP VIEW IF EXISTS V_RELATION_GRAPH;
-- CREATE OR REPLACE VIEW V_RELATION_GRAPH AS
-- WITH RECURSIVE
--     edges_base AS (
--         SELECT
--             s.CLIENT_SELLER_ID AS SELLER_ID,
--             s.CLIENT_ID AS CLIENT_ID,
--             SUM(s.SUM) AS total_sum,
--             COUNT(DISTINCT s.ID) AS tx_count,
--             MIN(s.CREATED_DATE) AS first_date,
--             MAX(s.CREATED_DATE) AS last_date
--         FROM SALE s
--         GROUP BY s.CLIENT_SELLER_ID, s.CLIENT_ID
--     ),
--
--     org_hierarchy AS (
--         SELECT
--             e.SELLER_ID AS edge_seller_id,
--             e.CLIENT_ID AS edge_client_id,
--             e.SELLER_ID AS root_seller_id,
--             1 AS depth,
--             CAST('|' || CAST(e.SELLER_ID AS VARCHAR(20)) || '|' || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|' AS VARCHAR(4000)) AS visited_path,
--             e.total_sum,
--             e.tx_count,
--             e.first_date,
--             e.last_date
--         FROM edges_base e
--
--         UNION ALL
--
--         SELECT
--             e.SELLER_ID AS edge_seller_id,
--             e.CLIENT_ID AS edge_client_id,
--             oh.root_seller_id,
--             oh.depth + 1 AS depth,
--             CAST(oh.visited_path || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|' AS VARCHAR(4000)) AS visited_path,
--             e.total_sum,
--             e.tx_count,
--             e.first_date,
--             e.last_date
--         FROM org_hierarchy oh
--                  INNER JOIN edges_base e ON e.SELLER_ID = oh.edge_client_id
--         WHERE oh.depth < 20
--           AND oh.visited_path NOT LIKE '%|' || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|%'
--     ),
--
--     ranked_hierarchy AS (
--         SELECT
--             *,
--             ROW_NUMBER() OVER (
--                 PARTITION BY root_seller_id, edge_seller_id, edge_client_id
--                 ORDER BY depth, LENGTH(visited_path)
--                 ) AS rn
--         FROM org_hierarchy
--     )
-- SELECT
--             ROW_NUMBER() OVER (ORDER BY root_seller_id, depth, edge_seller_id, edge_client_id) AS id,
--             root_seller_id,
--             CAST(edge_seller_id AS BIGINT) AS seller_id,
--             CAST(edge_client_id AS BIGINT) AS client_id,
--             visited_path AS all_nodes,
--             CAST(total_sum AS BIGINT) AS total_amount,
--             CAST(tx_count AS BIGINT) AS transaction_count,
--             CAST(depth AS BIGINT) AS depth,
--             CAST(0 AS BIGINT) AS is_cyclic,
--             -1 AS vstamp,
--             first_date AS created_date,
--             last_date AS updated_date,
--             1 AS created_by_user_id,
--             1 AS last_upd_by_user_id
-- FROM ranked_hierarchy
-- WHERE rn = 1
-- ORDER BY root_seller_id, depth, edge_seller_id, edge_client_id;
--

-- DROP VIEW IF EXISTS V_RELATION_GRAPH;
-- CREATE OR REPLACE VIEW V_RELATION_GRAPH AS
-- WITH RECURSIVE
--     edges_base AS (
--         SELECT
--             s.CLIENT_SELLER_ID AS SELLER_ID,
--             s.CLIENT_ID AS CLIENT_ID,
--             SUM(s.SUM) AS total_sum,
--             COUNT(DISTINCT s.ID) AS tx_count,
--             MIN(s.CREATED_DATE) AS first_date,
--             MAX(s.CREATED_DATE) AS last_date
--         FROM SALE s
--         GROUP BY s.CLIENT_SELLER_ID, s.CLIENT_ID
--     ),
--
--     org_hierarchy AS (
--         SELECT
--             e.SELLER_ID AS edge_seller_id,
--             e.CLIENT_ID AS edge_client_id,
--             e.SELLER_ID AS root_seller_id,
--             1 AS depth,
--             CAST('|' || CAST(e.SELLER_ID AS VARCHAR(20)) || '|' || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|' AS VARCHAR(4000)) AS visited_path
--         FROM edges_base e
--
--         UNION ALL
--
--         SELECT
--             e.SELLER_ID AS edge_seller_id,
--             e.CLIENT_ID AS edge_client_id,
--             oh.root_seller_id,
--             oh.depth + 1 AS depth,
--             CAST(oh.visited_path || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|' AS VARCHAR(4000)) AS visited_path
--         FROM org_hierarchy oh
--                  INNER JOIN edges_base e ON e.SELLER_ID = oh.edge_client_id
--         WHERE oh.depth < 20
--           AND oh.visited_path NOT LIKE '%|' || CAST(e.CLIENT_ID AS VARCHAR(20)) || '|%'
--     ),
--
--     unique_hierarchy AS (
--         SELECT DISTINCT
--             root_seller_id,
--             edge_seller_id,
--             edge_client_id,
--             MIN(visited_path) AS visited_path,
--             MIN(depth) AS depth,
--             CAST(edge_seller_id AS BIGINT)  + CAST(edge_client_id AS BIGINT) AS id
--         FROM org_hierarchy
--         GROUP BY root_seller_id, edge_seller_id, edge_client_id
--     )
-- SELECT
--     ROW_NUMBER() OVER (ORDER BY  root_seller_id, id, depth) AS id,
--     uh.root_seller_id,
--     uh.id as uniq_id,
--     CAST(uh.edge_seller_id AS BIGINT) AS seller_id,
--     CAST(uh.edge_client_id AS BIGINT) AS client_id,
--     uh.visited_path AS all_nodes,
--     CAST(eb.total_sum AS BIGINT) AS total_amount,
--     CAST(eb.tx_count AS BIGINT) AS transaction_count,
--     CAST(uh.depth AS BIGINT) AS depth,
--     CAST(0 AS BIGINT) AS is_cyclic,
--     -1 AS vstamp,
--     eb.first_date AS created_date,
--     eb.last_date AS updated_date,
--     1 AS created_by_user_id,
--     1 AS last_upd_by_user_id
-- FROM unique_hierarchy uh
--          INNER JOIN edges_base eb ON eb.SELLER_ID = uh.edge_seller_id AND eb.CLIENT_ID = uh.edge_client_id
-- ORDER BY uh.root_seller_id, uh.depth, uh.edge_seller_id, uh.edge_client_id;

-- CREATE OR REPLACE VIEW v_relation_graph AS
-- WITH RECURSIVE
-- -- Прямые продажи (depth = 0)
-- direct AS (
--     SELECT DISTINCT
--         client_seller_id as source_id,
--         client_id as target_id,
--         client_seller_id as root_id,
--         0 as depth
--     FROM sale
-- ),
-- -- Рекурсия вниз (потомки)
-- down AS (
--     SELECT * FROM direct
--     UNION
--     SELECT DISTINCT
--         s.client_seller_id,
--         s.client_id,
--         d.root_id,
--         d.depth + 1
--     FROM sale s
--              JOIN down d ON s.client_seller_id = d.target_id
--     WHERE d.depth < 10
-- ),
-- -- Рекурсия вверх (родители)
-- up AS (
--     SELECT DISTINCT
--         client_seller_id as source_id,
--         client_id as target_id,
--         client_id as root_id,
--         0 as depth
--     FROM sale
--     UNION
--     SELECT DISTINCT
--         s.client_seller_id,
--         s.client_id,
--         u.root_id,
--         u.depth - 1
--     FROM sale s
--              JOIN up u ON s.client_id = u.source_id
--     WHERE u.depth > -10
--       AND NOT EXISTS (
--         SELECT 1 FROM sale s2
--         WHERE s2.client_seller_id = s.client_id
--           AND s2.client_id = s.client_seller_id
--     )
-- ),
-- -- Объединяем все связи
-- all_relations AS (
--     SELECT source_id, target_id, root_id, depth FROM down
--     UNION
--     SELECT source_id, target_id, root_id, depth FROM up WHERE depth < 0
-- ),
-- -- Агрегируем суммы
-- aggregated AS (
--     SELECT
--         ar.root_id,
--         ar.source_id,
--         ar.target_id,
--         MIN(ar.depth) as depth,
--         SUM(s.sum) as total_sum,
--         BOOL_OR(ar.depth = 0) as is_direct
--     FROM all_relations ar
--              JOIN sale s ON s.client_seller_id = ar.source_id
--         AND s.client_id = ar.target_id
--     GROUP BY ar.root_id, ar.source_id, ar.target_id
-- )
-- SELECT
--             ROW_NUMBER() OVER (ORDER BY root_id, depth, source_id, target_id) as id,
--             source_id as source_node_id,
--             target_id as target_node_id,
--             seller.full_name as target_node_name,
--             CASE WHEN is_direct THEN 'MAIN' ELSE NULL END as target_node_type,
--             NULL::TEXT as edge_description,
--             total_sum as edge_value,
--             root_id as root_client_id,
--            false as target_node_expanded,
--             depth,
--             0 as vstamp,
--             current_date as created_date,
--             current_date as updated_date,
--             1 as created_by_user_id,
--             1 as last_upd_by_user_id
-- FROM aggregated
--          LEFT JOIN client seller ON seller.id = source_id
-- ORDER BY root_id, depth, source_id, target_id;



--
-- CREATE OR REPLACE VIEW v_relation_graph AS
-- WITH RECURSIVE
-- -- Прямые продажи (depth = 0)
-- direct AS (
--     SELECT DISTINCT
--         client_seller_id as source_id,
--         client_id as target_id,
--         client_seller_id as root_id,
--         0 as depth
--     FROM sale
-- ),
-- -- Рекурсия вниз (потомки)
-- down AS (
--     SELECT * FROM direct
--     UNION
--     SELECT DISTINCT
--         s.client_seller_id,
--         s.client_id,
--         d.root_id,
--         d.depth + 1
--     FROM sale s
--              JOIN down d ON s.client_seller_id = d.target_id
--     WHERE d.depth < 10
-- ),
-- -- Рекурсия вверх (родители)
-- up AS (
--     SELECT DISTINCT
--         client_seller_id as source_id,
--         client_id as target_id,
--         client_id as root_id,
--         0 as depth
--     FROM sale
--     UNION
--     SELECT DISTINCT
--         s.client_seller_id,
--         s.client_id,
--         u.root_id,
--         u.depth - 1
--     FROM sale s
--              JOIN up u ON s.client_id = u.source_id
--     WHERE u.depth > -10
-- ),
-- -- Объединяем ВСЕ связи (включая дубликаты и циклы)
-- all_relations_raw AS (
--     SELECT source_id, target_id, root_id, depth FROM down
--     UNION ALL
--     SELECT source_id, target_id, root_id, depth FROM up WHERE depth < 0
-- ),
-- -- Убираем обратные связи (циклы)
-- -- Оставляем только связи где source_id < target_id ИЛИ это прямая связь (depth=0)
-- all_relations AS (
--     SELECT DISTINCT
--         source_id,
--         target_id,
--         root_id,
--         depth
--     FROM all_relations_raw
--     WHERE depth = 0  -- Всегда включаем прямые связи
--        OR source_id < target_id  -- Для остальных - только одно направление
--        OR NOT EXISTS (  -- Или если нет обратной связи
--         SELECT 1 FROM all_relations_raw ar2
--         WHERE ar2.source_id = all_relations_raw.target_id
--           AND ar2.target_id = all_relations_raw.source_id
--           AND ar2.root_id = all_relations_raw.root_id
--     )
-- ),
-- -- Агрегируем суммы
-- aggregated AS (
--     SELECT
--         ar.root_id,
--         ar.source_id,
--         ar.target_id,
--         MIN(ar.depth) as depth,
--         SUM(s.sum) as total_sum,
--         BOOL_OR(ar.depth = 0) as is_direct
--     FROM all_relations ar
--              JOIN sale s ON s.client_seller_id = ar.source_id
--         AND s.client_id = ar.target_id
--     GROUP BY ar.root_id, ar.source_id, ar.target_id
-- )
-- SELECT
--             ROW_NUMBER() OVER (ORDER BY root_id, depth, source_id, target_id) as id,
--             source_id as source_node_id,
--             target_id as target_node_id,
--             seller.full_name as target_node_name,
--             CASE WHEN is_direct THEN 'MAIN' ELSE NULL END as target_node_type,
--             NULL::TEXT as edge_description,
--             total_sum as edge_value,
--             root_id as root_client_id,
--             false as target_node_expanded,
--             depth,
--             0 as vstamp,
--             current_date as created_date,
--             current_date as updated_date,
--             1 as created_by_user_id,
--             1 as last_upd_by_user_id
-- FROM aggregated
--          LEFT JOIN client seller ON seller.id = source_id
-- ORDER BY root_id, depth, source_id, target_id;



-- --
-- CREATE OR REPLACE VIEW v_relation_graph AS
-- WITH RECURSIVE
-- -- Прямые продажи (depth = 0)
-- direct AS (
--     SELECT DISTINCT
--         client_seller_id as source_id,
--         client_id as target_id,
--         client_seller_id as root_id,
--         0 as depth
--     FROM sale
-- ),
-- -- Рекурсия вниз (потомки)
-- down AS (
--     SELECT * FROM direct
--     UNION
--     SELECT DISTINCT
--         s.client_seller_id,
--         s.client_id,
--         d.root_id,
--         d.depth + 1
--     FROM sale s
--              JOIN down d ON s.client_seller_id = d.target_id
--     WHERE d.depth < 10
-- ),
-- -- Рекурсия вверх (родители) - БЕЗ циклов
-- up AS (
--     SELECT DISTINCT
--         client_seller_id as source_id,
--         client_id as target_id,
--         client_id as root_id,
--         0 as depth
--     FROM sale
--     UNION
--     SELECT DISTINCT
--         s.client_seller_id,
--         s.client_id,
--         u.root_id,
--         u.depth - 1
--     FROM sale s
--              JOIN up u ON s.client_id = u.source_id
--     WHERE u.depth > -10
--       -- КРИТИЧНО: Исключаем обратные связи из direct
--       AND NOT EXISTS (
--         SELECT 1 FROM direct d
--         WHERE d.source_id = s.client_id AND d.target_id = s.client_seller_id
--     )
-- ),
-- -- Объединяем связи
-- all_relations AS (
--     SELECT source_id, target_id, root_id, depth FROM down
--     UNION
--     SELECT source_id, target_id, root_id, depth FROM up WHERE depth < 0
-- ),
-- -- Агрегируем
-- aggregated AS (
--     SELECT
--         ar.root_id,
--         ar.source_id,
--         ar.target_id,
--         MIN(ar.depth) as depth,
--         SUM(s.sum) as total_sum,
--         BOOL_OR(ar.depth = 0) as is_direct
--     FROM all_relations ar
--              JOIN sale s ON s.client_seller_id = ar.source_id
--         AND s.client_id = ar.target_id
--     GROUP BY ar.root_id, ar.source_id, ar.target_id
-- )
-- SELECT
--             ROW_NUMBER() OVER (ORDER BY root_id, depth, source_id, target_id) as id,
--             source_id as source_node_id,
--             target_id as target_node_id,
--             seller.full_name as target_node_name,
--             CASE WHEN is_direct THEN 'MAIN' ELSE NULL END as target_node_type,
--             NULL::TEXT as edge_description,
--             total_sum as edge_value,
--             root_id as root_client_id,
--             true as target_node_expanded,
--             depth,
--             0 as vstamp,
--             current_date as created_date,
--             current_date as updated_date,
--             1 as created_by_user_id,
--             1 as last_upd_by_user_id
-- FROM aggregated
--          LEFT JOIN client seller ON seller.id = source_id
-- ORDER BY root_id, depth, source_id, target_id;
--

-- ============================================================================
-- FIXED v_relation_graph - Prevents circular relationships
-- ============================================================================
-- ============================================================================
-- FIXED v_relation_graph - WITH CORRECT ARRAY TYPES
-- ============================================================================
-- CREATE OR REPLACE VIEW v_relation_graph AS
-- WITH RECURSIVE
--
-- -- 1. Direct sales (depth = 0)
-- direct AS (
--     SELECT DISTINCT
--         s.client_seller_id AS source_id,
--         s.client_id        AS target_id,
--         s.client_seller_id AS root_id,
--         0                  AS depth
--     FROM sale s
-- ),
--
-- -- 2. Recursive down (descendants)
-- down AS (
--     SELECT
--         source_id,
--         target_id,
--         root_id,
--         depth
--     FROM direct
--
--     UNION
--
--     SELECT DISTINCT
--         s.client_seller_id AS source_id,
--         s.client_id        AS target_id,
--         d.root_id,
--         d.depth + 1        AS depth
--     FROM sale s
--              JOIN down d
--                   ON s.client_seller_id = d.target_id
--     WHERE d.depth < 10
-- ),
--
-- -- 3. Recursive up (ancestors)
-- up AS (
--     SELECT DISTINCT
--         s.client_seller_id AS source_id,
--         s.client_id        AS target_id,
--         s.client_id        AS root_id,
--         0                  AS depth
--     FROM sale s
--
--     UNION
--
--     SELECT DISTINCT
--         s.client_seller_id AS source_id,
--         s.client_id        AS target_id,
--         u.root_id,
--         u.depth - 1        AS depth
--     FROM sale s
--              JOIN up u
--                   ON s.client_id = u.source_id
--     WHERE u.depth > -10
--       AND NOT EXISTS (
--         SELECT 1
--         FROM direct d
--         WHERE d.source_id = s.client_id
--           AND d.target_id = s.client_seller_id
--     )
-- ),
--
-- -- 4. Combine down + up (deduplicated by root_id, source_id, target_id, depth)
-- all_relations AS (
--     SELECT DISTINCT root_id, source_id, target_id, depth
--     FROM (
--              SELECT root_id, source_id, target_id, depth FROM down
--              UNION ALL
--              SELECT root_id, source_id, target_id, depth FROM up WHERE depth < 0
--          ) combined
-- ),
--
-- -- 5. Aggregate: for each (root_id, source_id, target_id), compute metrics
-- --    Join to sale ONCE per unique edge
-- aggregated AS (
--     SELECT
--         ar.root_id,
--         ar.source_id,
--         ar.target_id,
--         MIN(ar.depth)         AS depth,
--         COALESCE(SUM(s.sum), 0) AS total_sum,
--         BOOL_OR(ar.depth = 0) AS is_direct,
--         COUNT(s.id)           AS sale_count
--     FROM all_relations ar
--              LEFT JOIN sale s
--                        ON s.client_seller_id = ar.source_id
--                            AND s.client_id        = ar.target_id
--     GROUP BY ar.root_id, ar.source_id, ar.target_id
-- ),
--
-- -- 6. Orient edges per root: if A→B and B→A exist, keep closer to root
-- oriented AS (
--     SELECT a.*
--     FROM aggregated a
--     WHERE NOT EXISTS (
--         SELECT 1
--         FROM aggregated x
--         WHERE x.root_id   = a.root_id
--           AND x.source_id = a.target_id
--           AND x.target_id = a.source_id
--           AND x.depth     < a.depth
--     )
-- )
--
-- -- 7. Final projection
-- SELECT
--             ROW_NUMBER() OVER (
--         ORDER BY o.root_id, o.depth, o.source_id, o.target_id
--         ) AS id,
--
--             o.source_id AS source_node_id,
--             o.target_id AS target_node_id,
--             o.root_id   AS root_client_id,
--
--             src.full_name AS source_node_name,
--             tgt.full_name AS target_node_name,
--
--             CASE WHEN o.is_direct THEN 'MAIN' ELSE 'INDIRECT' END AS target_node_type,
--             NULL::TEXT AS edge_description,
--
--             o.total_sum  AS edge_value,
--             o.sale_count AS sale_count,
--             o.depth      AS depth,
--
--             o.is_direct        AS is_direct_relation,
--             (o.depth = 0)      AS is_zero_depth,
--             (o.depth > 0)      AS is_downstream,
--             (o.depth < 0)      AS is_upstream,
--             ABS(o.depth)       AS absolute_depth,
--
--             CASE
--                 WHEN o.depth = 0 THEN 'DIRECT'
--                 WHEN o.depth > 0 THEN 'DESCENDANT'
--                 WHEN o.depth < 0 THEN 'ANCESTOR'
--                 ELSE 'UNKNOWN'
--                 END AS relation_category,
--
--             CASE
--                 WHEN o.total_sum < 50  THEN 'LOW'
--                 WHEN o.total_sum < 100 THEN 'MEDIUM'
--                 WHEN o.total_sum < 500 THEN 'HIGH'
--                 ELSE 'VERY_HIGH'
--                 END AS value_range,
--
--             TRUE AS target_node_expanded,
--
--             0            AS vstamp,
--             current_date AS created_date,
--             current_date AS updated_date,
--             1            AS created_by_user_id,
--             1            AS last_upd_by_user_id
--
-- FROM oriented o
--          LEFT JOIN client src ON src.id = o.source_id
--          LEFT JOIN client tgt ON tgt.id = o.target_id
-- ORDER BY o.root_id, o.depth, o.source_id, o.target_id;



CREATE OR REPLACE VIEW v_relation_graph AS
WITH RECURSIVE

sales_aggregated AS (
    SELECT
        client_seller_id AS source_id,
        client_id        AS target_id,
        SUM(sum)         AS total_sum,
        COUNT(id)        AS sale_count
    FROM sale
    GROUP BY client_seller_id, client_id
),

-- STEP 2: All unique nodes that participate in sales (both as seller and client)
all_nodes AS (
    SELECT DISTINCT client_seller_id AS node_id FROM sale
    UNION
    SELECT DISTINCT client_id AS node_id FROM sale
),

downstream AS (
    SELECT
        an.node_id AS root_id,
        sa.source_id,
        sa.target_id,
        0 AS depth,
        sa.total_sum,
        sa.sale_count,
        true AS is_direct
    FROM all_nodes an
             JOIN sales_aggregated sa ON sa.source_id = an.node_id

    UNION

    SELECT
        d.root_id,
        sa.source_id,
        sa.target_id,
        d.depth + 1 AS depth,
        sa.total_sum,
        sa.sale_count,
        false AS is_direct
    FROM downstream d
             JOIN sales_aggregated sa ON sa.source_id = d.target_id
    WHERE d.depth < 200
),

upstream AS (
    -- Base case: direct purchases by each node (node as client)
    SELECT
        an.node_id AS root_id,
        sa.source_id,
        sa.target_id,
        0 AS depth,
        sa.total_sum,
        sa.sale_count,
        true AS is_direct
    FROM all_nodes an
             JOIN sales_aggregated sa ON sa.target_id = an.node_id

    UNION

    -- Recursive: follow the chain upward
    SELECT
        u.root_id,
        sa.source_id,
        sa.target_id,
        u.depth - 1 AS depth,
        sa.total_sum,
        sa.sale_count,
        false AS is_direct
    FROM upstream u
             JOIN sales_aggregated sa ON sa.target_id = u.source_id
    WHERE u.depth > -2000
      -- Prevent simple back-and-forth cycles
      AND NOT EXISTS (
        SELECT 1
        FROM sales_aggregated sa2
        WHERE sa2.source_id = sa.target_id
          AND sa2.target_id = sa.source_id
--           AND sa.source_id < sa.target_id  -- Keep only one direction
    )
),

all_relations AS (
    SELECT root_id, source_id, target_id, depth, total_sum, sale_count, is_direct
    FROM downstream

    UNION ALL

    SELECT root_id, source_id, target_id, depth, total_sum, sale_count, is_direct
    FROM upstream
--     WHERE depth < 0  -- Only include upstream paths (negative depth)
),

-- STEP 6: For each (root_id, source_id, target_id), keep the shortest path
aggregated AS (
    SELECT
        root_id,
        source_id,
        target_id,
        MIN(depth) AS depth,
        MAX(total_sum) AS total_sum,
        MAX(sale_count) AS sale_count,
        BOOL_OR(is_direct) AS is_direct
    FROM all_relations
    GROUP BY root_id, source_id, target_id
),

-- STEP 7: Remove back edges within same root
-- If for same root we have both A→B and B→A, keep only the one closer to root
oriented AS (
    SELECT a.*
    FROM aggregated a
    WHERE NOT EXISTS (
        SELECT 1
        FROM aggregated x
        WHERE x.root_id   = a.root_id
          AND x.source_id = a.target_id
          AND x.target_id = a.source_id
--           AND (
--             x.depth < a.depth  -- x is closer
--                 OR (x.depth = a.depth AND x.source_id < a.source_id)  -- tie-breaker
--             )
    )
)

-- STEP 8: Final output with all required columns
SELECT
            ROW_NUMBER() OVER (
        ORDER BY o.root_id, o.depth, o.source_id, o.target_id
        ) AS id,

            o.source_id AS source_node_id,
            o.target_id AS target_node_id,
            o.root_id   AS root_client_id,

            tgt.full_name AS target_node_name,

            CASE WHEN o.is_direct THEN 'MAIN' ELSE 'INDIRECT' END AS target_node_type,
            src.full_name  AS edge_description,

            o.total_sum  AS edge_value,
            o.sale_count AS sale_count,
            o.depth      AS depth,

            o.is_direct        AS is_direct_relation,
            (o.depth = 0)      AS is_zero_depth,
            (o.depth > 0)      AS is_downstream,
            (o.depth < 0)      AS is_upstream,
            ABS(o.depth)       AS absolute_depth,

            CASE
                WHEN o.depth = 0 THEN 'DIRECT'
                WHEN o.depth > 0 THEN 'DESCENDANT'
                WHEN o.depth < 0 THEN 'ANCESTOR'
                ELSE 'UNKNOWN'
                END AS relation_category,

            CASE
                WHEN o.total_sum < 50  THEN 'LOW'
                WHEN o.total_sum < 100 THEN 'MEDIUM'
                WHEN o.total_sum < 500 THEN 'HIGH'
                ELSE 'VERY_HIGH'
                END AS value_range,

            TRUE AS target_node_expanded,

            0            AS vstamp,
            current_date AS created_date,
            current_date AS updated_date,
            1            AS created_by_user_id,
            1            AS last_upd_by_user_id

FROM oriented o
         LEFT JOIN client src ON src.id = o.source_id
         LEFT JOIN client tgt ON tgt.id = o.target_id
ORDER BY o.root_id, o.depth, o.source_id, o.target_id;

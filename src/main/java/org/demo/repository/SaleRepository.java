package org.demo.repository;

import java.util.List;
import java.util.Set;
import org.demo.entity.Sale;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.projection.DashboardSalesByMonthAndProductPrj;
import org.demo.repository.projection.DashboardSalesByMonthAndStatusPrj;
import org.demo.repository.projection.DashboardSalesProductPrj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>, JpaSpecificationExecutor<Sale> {

	@Query("""
			SELECT new org.demo.repository.projection.DashboardSalesProductPrj((c.id || s.product) as id, c.fullName as clientName, s.product as productName, SUM(s.sum) as sum)
			FROM Sale s JOIN s.client c
			WHERE (:fieldOfActivities IS NULL OR EXISTS (SELECT 1 FROM c.fieldOfActivities fa WHERE fa IN :fieldOfActivities))
			GROUP BY c.id, s.product
			ORDER BY c.fullName ASC, s.product ASC
			""")
	List<DashboardSalesProductPrj> getSalesStatsByFieldOfActivity(Set<FieldOfActivity> fieldOfActivities);

	@Query("""
			SELECT new org.demo.repository.projection.DashboardSalesByMonthAndStatusPrj(
			CONCAT(MONTH(s.createdDate), '-', YEAR(s.createdDate), '-', s.status) as id,
			MONTH(s.createdDate) as month,
			YEAR(s.createdDate) as year,
			s.status as status,
			COUNT(s.id) as count
			)
			FROM Sale s JOIN s.client c
			WHERE (:fieldOfActivities IS NULL OR EXISTS (SELECT 1 FROM c.fieldOfActivities fa WHERE fa IN :fieldOfActivities))
			GROUP BY MONTH(s.createdDate), YEAR(s.createdDate), s.status
			ORDER BY year, month, s.status
			""")
	List<DashboardSalesByMonthAndStatusPrj> getSalesStatsByMonthAndStatus(Set<FieldOfActivity> fieldOfActivities);

	@Query("""
			SELECT new org.demo.repository.projection.DashboardSalesByMonthAndProductPrj(
			CONCAT(MONTH(s.createdDate), '-', YEAR(s.createdDate), '-', s.product) as id,
			MONTH(s.createdDate) as month,
			YEAR(s.createdDate) as year,
			s.product as product,
			SUM(s.sum) as sum
			)
			FROM Sale s JOIN s.client c
			WHERE (:fieldOfActivities IS NULL OR EXISTS (SELECT 1 FROM c.fieldOfActivities fa WHERE fa IN :fieldOfActivities))
			GROUP BY MONTH(s.createdDate), YEAR(s.createdDate), s.product
			ORDER BY year, month, s.product
			""")
	List<DashboardSalesByMonthAndProductPrj> getSalesByMonthAndProduct(Set<FieldOfActivity> fieldOfActivities);


//	@Query(nativeQuery = true, value = """
//			WITH RECURSIVE org_hierarchy AS (
//			    SELECT
//			        s.CLIENT_SELLER_ID AS SELLER_ID,
//			        s.CLIENT_ID AS CLIENT_ID,
//			        1 AS depth,
//			        ARRAY[s.CLIENT_SELLER_ID, s.CLIENT_ID]::BIGINT[] AS path
//			    FROM SALE s
//			    WHERE s.CLIENT_SELLER_ID IS NOT NULL
//			      AND s.CLIENT_ID IS NOT NULL
//			      AND (s.CLIENT_SELLER_ID = :clientId OR s.CLIENT_ID = :clientId)
//
//			    UNION ALL
//						    SELECT
//			        CASE
//			            WHEN s.CLIENT_SELLER_ID = oh.CLIENT_ID THEN oh.SELLER_ID
//			            ELSE s.CLIENT_SELLER_ID
//			            END AS SELLER_ID,
//			        CASE
//			            WHEN s.CLIENT_SELLER_ID = oh.CLIENT_ID THEN s.CLIENT_ID
//			            ELSE oh.CLIENT_ID
//			            END AS CLIENT_ID,
//			        oh.depth + 1,
//			        CASE
//			            WHEN s.CLIENT_SELLER_ID = oh.CLIENT_ID THEN oh.path || ARRAY[s.CLIENT_ID]::BIGINT[]
//			            ELSE ARRAY[s.CLIENT_SELLER_ID]::BIGINT[] || oh.path
//			            END AS path
//			    FROM org_hierarchy oh
//			             INNER JOIN SALE s ON (s.CLIENT_SELLER_ID = oh.CLIENT_ID OR s.CLIENT_ID = oh.SELLER_ID)
//			    WHERE oh.depth < 1000
//			      AND NOT (
//			        (s.CLIENT_SELLER_ID = oh.CLIENT_ID AND oh.path @> ARRAY[s.CLIENT_ID]::BIGINT[])
//			            OR (s.CLIENT_ID = oh.SELLER_ID AND oh.path @> ARRAY[s.CLIENT_SELLER_ID]::BIGINT[])
//			        )
//			)
//			SELECT
//			            CAST(ROW_NUMBER() OVER (ORDER BY depth, SELLER_ID, CLIENT_ID) AS TEXT) AS id,
//			            CAST(oh.SELLER_ID AS BIGINT) AS SELLER_ID,
//			            CAST(oh.CLIENT_ID AS BIGINT) AS CLIENT_ID,
//			            CAST(COALESCE(SUM(s.SUM), 0) AS BIGINT) AS total_amount,
//			            CAST(COUNT(DISTINCT s.ID) AS BIGINT) AS transaction_count,
//			            CAST(oh.depth AS BIGINT) AS depth,
//			            ARRAY_TO_STRING(oh.path, '/') AS path,
//			            CAST(0 AS BIGINT) AS is_cyclic
//			FROM org_hierarchy oh
//			         LEFT JOIN SALE s ON (
//			    (s.CLIENT_SELLER_ID = oh.SELLER_ID AND s.CLIENT_ID = oh.CLIENT_ID)
//			    )
//			GROUP BY oh.SELLER_ID, oh.CLIENT_ID, oh.depth, oh.path
//			ORDER BY depth, SELLER_ID, CLIENT_ID;
//			""")
//	List<RelationProjection> findOrgHierarchyByClientId(@Param("clientId") Long clientId);

}

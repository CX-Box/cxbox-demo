package org.demo.repository;

import java.util.List;
import java.util.Set;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.entity.Sale;
import org.demo.entity.Sale_;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.projection.DashboardSalesByMonthAndProductPrj;
import org.demo.repository.projection.DashboardSalesByMonthAndStatusPrj;
import org.demo.repository.projection.DashboardSalesProductPrj;
import org.springframework.data.jpa.domain.Specification;
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

	default Specification<Sale> findSalesByClientId(Long clientId) {
		return (root, cq, cb) -> cb.or(
				cb.equal(root.get(Sale_.clientSeller).get(BaseEntity_.id), clientId),
				cb.equal(root.get(Sale_.client).get(BaseEntity_.id), clientId)
		);
	}
}

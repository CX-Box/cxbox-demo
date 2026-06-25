package org.demo.repository;

import jakarta.persistence.criteria.Join;
import java.util.List;
import java.util.Set;
import org.demo.entity.Client;
import org.demo.entity.Client_;
import org.demo.conf.cxbox.extension.fulltextsearch.FullTextSearchExt;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.repository.projection.DashboardClientSalesStatsPrj;
import org.demo.repository.projection.DashboardSalesClientPrj;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {

	default Specification<Client> getFullTextSearchSpecification(String value) {
		return getAddressLikeIgnoreCaseSpecification(value)
				.or(getFullNameLikeIgnoreCaseSpecification(value));
	}

	default Specification<Client> getFullNameLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) -> FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Client_.fullName));
	}

	default Specification<Client> getAddressLikeIgnoreCaseSpecification(String value) {
		return (root, query, cb) -> FullTextSearchExt.likeIgnoreCase(value, cb, root.get(Client_.address));
	}

	default Specification<Client> findAllByFieldOfActivities(Set<FieldOfActivity> fieldOfActivities) {
		return (root, query, cb) -> {
			if (fieldOfActivities == null || fieldOfActivities.isEmpty()) {
				return cb.conjunction();
			}
			Join<Client, FieldOfActivity> join = root.join(Client_.fieldOfActivities);
			assert query != null;
			query.distinct(true);
			return join.in(fieldOfActivities);
		};
	}

	@Query("""
			SELECT c.status, COUNT(c)
			FROM Client c
			GROUP BY c.status
			""")
	List<Object[]> countGroupedByStatus();

	@Query("""
			SELECT c.status, COUNT(DISTINCT c)
			FROM Client c
			JOIN c.fieldOfActivities f
			WHERE (f IN :fieldOfActivities)
			GROUP BY c.status
			""")
	List<Object[]> countGroupedByStatus(
			@Param("fieldOfActivities") Set<FieldOfActivity> fieldOfActivities
	);


	@Query("""
			SELECT new org.demo.repository.projection.DashboardClientSalesStatsPrj(
			min(c.fullName),
			COUNT(DISTINCT s.id),
			c.id
			)
			FROM Client c
			JOIN c.salesClientList s
			JOIN c.fieldOfActivities f
			WHERE (:fieldOfActivities IS NULL OR EXISTS (
						SELECT 1
						FROM c.fieldOfActivities fa
						WHERE fa IN :fieldOfActivities
		))
			GROUP BY c.id
		""")
	List<DashboardClientSalesStatsPrj> countGroupedBySales(
			@Param("fieldOfActivities") Set<FieldOfActivity> fieldOfActivities
	);

	@Query("""
			SELECT new org.demo.repository.projection.DashboardSalesClientPrj(
			CONCAT(min(c.id), '-', min(seller.id)),
			c.fullName,
			seller.fullName,
			SUM(s.sum),
			COUNT(s.id),
			MAX(s.status),
			MIN(s.saleDate),
			MAX(s.saleDate),
			ROUND(AVG(s.sum), 0),
			MAX(s.sum),
			SUM(CASE WHEN s.status = 'CLOSED' THEN s.sum ELSE 0 END),
			SUM(CASE WHEN s.status = 'OPEN' THEN s.sum ELSE 0 END)
			)
			FROM Client c
			JOIN c.salesClientList s
			JOIN s.clientSeller seller
			WHERE (:fieldOfActivities IS NULL OR EXISTS (
					SELECT 1
					FROM c.fieldOfActivities fa
					WHERE fa IN :fieldOfActivities
			))
			GROUP BY
					c.fullName,
					seller.fullName
			""")
	List<DashboardSalesClientPrj> getSalesClientByFieldOfActivity(
			@Param("fieldOfActivities") Set<FieldOfActivity> fieldOfActivities
	);

}

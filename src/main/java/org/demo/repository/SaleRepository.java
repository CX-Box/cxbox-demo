package org.demo.repository;

import java.util.List;
import java.util.Set;
import org.demo.entity.Sale;
import org.demo.entity.enums.FieldOfActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>, JpaSpecificationExecutor<Sale> {


	List<Sale> findAllByClientFieldOfActivitiesIn(Set<FieldOfActivity> fieldOfActivities);


}

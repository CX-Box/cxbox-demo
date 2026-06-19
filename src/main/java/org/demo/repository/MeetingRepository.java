package org.demo.repository;

import java.util.List;
import org.demo.entity.Meeting;
import org.demo.entity.enums.MeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long>, JpaSpecificationExecutor<Meeting> {

	List<Meeting> findByStatus(MeetingStatus status);

	@Query("""
	SELECT m.status, COUNT(m)
	FROM Meeting m
	GROUP BY m.status
	""")
	List<Object[]> countGroupedByStatus();


}

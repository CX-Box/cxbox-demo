package org.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.demo.entity.CalendarYearMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingsByDayRepository extends JpaRepository<CalendarYearMeeting, Long>,
		JpaSpecificationExecutor<CalendarYearMeeting> {

	List<CalendarYearMeeting> findAllByEventDateBetween(LocalDateTime start, LocalDateTime end);

}

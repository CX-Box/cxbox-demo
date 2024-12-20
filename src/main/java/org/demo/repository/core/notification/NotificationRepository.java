package org.demo.repository.core.notification;

import java.util.List;
import org.demo.conf.cxbox.extension.notification.entity.NotificationEntity;
import org.demo.entity.core.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

	@Modifying
	@Query("UPDATE NotificationEntity n SET n.isRead = true WHERE n.id IN :ids")
	void markAsRead(@Param("ids") List<Long> ids);

	Page<NotificationEntity> findAllByUser(User user, Pageable pageable);

	Long countByUser(User user);

	Long countByUserAndIsRead(User user, Boolean isRead);

}

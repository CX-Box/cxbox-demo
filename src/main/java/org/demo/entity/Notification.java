package org.demo.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.core.User;

@Setter
@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "NOTIFICATION")
public class Notification extends BaseEntity {

	/**
	 * Notification Owner
	 */
	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	/**
	 * Marking whether the notification has been read or not
	 */
	private Boolean isRead;

	/**
	 * Message text
	 */
	private String text;

	/**
	 * Create date UTC format
	 */
	private LocalDateTime createdDateUtc;

}

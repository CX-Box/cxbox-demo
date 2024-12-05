package org.demo.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.core.NotificationLinkEntity;
import org.demo.entity.core.User;

@Setter
@Getter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@Table(name = "NOTIFICATION")
public class NotificationEntity extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "USER_ID")
	private User user;

	private Boolean isRead;

	private String text;

	private LocalDateTime createdDateUtc;

	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
	@JoinColumn(name = "NOTIFICATION_ID")
	private List<NotificationLinkEntity> links;

}

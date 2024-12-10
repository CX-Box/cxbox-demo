package org.demo.conf.cxbox.extension.notification.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode(callSuper = true)
@Table(name = "NOTIFICATION")
public class NotificationEntity extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "USER_ID")
	private User user;

	private Boolean isRead;

	private String text;

	private LocalDateTime createdDateUtc;

	@Builder.Default
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY, mappedBy = "notification")
	private List<NotificationLinkEntity> links = new ArrayList<>();

	/**
	 * see <a href="https://vladmihalcea.com/the-best-way-to-map-a-onetomany-association-with-jpa-and-hibernate/">best way to map a OneToMany association</a>
	 */
	public void addNotificationLinks(List<NotificationLinkEntity> links) {
		this.links.addAll(links);
		links.forEach(link -> link.setNotification(this));
	}

	public void removeNotificationLinks(NotificationLinkEntity link) {
		this.links.remove(link);
		link.setNotification(null);
	}

}

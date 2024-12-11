package org.demo.conf.cxbox.extension.notification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.model.core.entity.BaseEntity;

@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "NOTIFICATION_LINKS")
public class NotificationLinkEntity extends BaseEntity {

	@Column
	private String drillDownLink;

	@Column
	private String drillDownLabel;

	@Column
	private DrillDownType drillDownType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "NOTIFICATION_ID", nullable = false)
	private NotificationEntity notification;

}

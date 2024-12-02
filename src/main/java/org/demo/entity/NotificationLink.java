package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@Table(name = "NOTIFICATION_LINKS")
public class NotificationLink extends BaseEntity {

	@Column
	private String drillDownLink;

	@Column
	private String drillDownLabel;

	@Column
	private DrillDownType drillDownType;

}

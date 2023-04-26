package org.demo.entity;

import org.demo.entity.enums.FieldOfActivity;
import org.cxbox.model.core.entity.BaseEntity;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "DASHBOARD_FILTER")
@Getter
@Setter
@NoArgsConstructor
public class DashboardFilter extends BaseEntity {

	@ElementCollection(targetClass = FieldOfActivity.class)
	@CollectionTable(name = "DASHBOARD_FILTER_FIELD_OF_ACTIVITY", joinColumns = @JoinColumn(name = "DASHBOARD_FILTER_ID"))
	@Column(name = "VALUE", nullable = false)
	@Enumerated(EnumType.STRING)
	private Set<FieldOfActivity> fieldOfActivities = new HashSet<>();

	private Long userId;

}

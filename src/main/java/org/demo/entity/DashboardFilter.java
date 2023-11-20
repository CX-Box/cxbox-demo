package org.demo.entity;

import lombok.EqualsAndHashCode;
import org.demo.entity.enums.FieldOfActivity;
import org.cxbox.model.core.entity.BaseEntity;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "DASHBOARD_FILTER")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class DashboardFilter extends BaseEntity {

	@ElementCollection(targetClass = FieldOfActivity.class)
	@CollectionTable(name = "DASHBOARD_FILTER_FIELD_OF_ACTIVITY", joinColumns = @JoinColumn(name = "DASHBOARD_FILTER_ID"))
	@Column(name = "VALUE", nullable = false)
	@Enumerated(EnumType.STRING)
	private Set<FieldOfActivity> fieldOfActivities = new HashSet<>();

	private Long userId;

}

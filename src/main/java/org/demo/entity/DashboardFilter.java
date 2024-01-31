package org.demo.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import lombok.EqualsAndHashCode;
import org.cxbox.model.core.entity.User;
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
@EqualsAndHashCode(of = {}, callSuper = true)
public class DashboardFilter extends BaseEntity {

	@ElementCollection(targetClass = FieldOfActivity.class)
	@CollectionTable(name = "DASHBOARD_FILTER_FIELD_OF_ACTIVITY", joinColumns = @JoinColumn(name = "DASHBOARD_FILTER_ID"))
	@Column(name = "VALUE", nullable = false)
	@Enumerated(EnumType.STRING)
	private Set<FieldOfActivity> fieldOfActivities = new HashSet<>();

	@OneToOne()
	@JoinColumn(name = "USER_ID", unique = true, nullable = false, updatable = false)
	private AppUser user;

	@Column
	private String taskId;

	@Column
	private String taskStatuses;

	@Column
	private String memberTypes;

	@JoinTable(name = "DashboardFilter_AppUser",
			joinColumns = @JoinColumn(name = "DashboardFilter_id"),
			inverseJoinColumns = @JoinColumn(name = "AppUser_id")
	)
	@ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
	private List<AppUser> membersList = new ArrayList<>();

	@Column
	private LocalDateTime registratinDateFrom;

	@Column
	private LocalDateTime registratinDateTo;

	@Column
	private LocalDateTime endDateTimeFrom;

	@Column
	private LocalDateTime endDateTimeTo;

	@Column
	private LocalDateTime startDateTimeFrom;

	@Column
	private LocalDateTime startDateTimeTo;

	@Column
	private String taskTypes;

	@Column
	private String taskResolutions;

}

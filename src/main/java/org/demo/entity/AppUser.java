package org.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.model.core.entity.BaseEntity;
import org.cxbox.model.core.entity.Department;
import org.cxbox.model.core.entity.UserRole;
import org.hibernate.envers.NotAudited;

@Entity
@Table(name = "users") // users, а не user, т.к. это служебное слово oracle
@Getter
@Setter
public class AppUser extends BaseEntity {

	@OneToOne(cascade = CascadeType.ALL)
	private DashboardFilter dashboardFilter;

	private String login;

	private String firstName;   // имя

	private String lastName;    // фамилия

	private String patronymic;

	private String phone;

	private String email;

	private String fullUserName;

	private String title;

	@Column(name = "ext_attr_11")
	private String extensionAttribute11;

	@Column(name = "ext_attr_12")
	private String extensionAttribute12;

	@Column(name = "ext_attr_13")
	private String extensionAttribute13;

	@Column(name = "ext_attr_14")
	private String extensionAttribute14;

	@Column(name = "ext_attr_15")
	private String extensionAttribute15;

	@Column(name = "DN")
	private String dn;

	private String origDeptCode;

	@ManyToOne
	@JoinColumn(name = "dept_id")
	private Department department;

	@JsonIgnore
	private String password;

	@Deprecated
	@Column(name = "internal_role_cd")
	private LOV internalRole;

	@NotAudited
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
	private List<UserRole> userRoleList;

	private LOV timezone;

	private LOV locale;

	private String userPrincipalName;

	@Column(name = "active")
	private Boolean active;


}

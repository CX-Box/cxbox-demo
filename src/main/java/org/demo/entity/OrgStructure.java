package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.core.Dept;
import org.demo.entity.core.User;
import org.demo.entity.enums.OrgStructureType;

/**
 * Organisational structure tree: department and user nodes linked by {@link #parent}.
 * A node refers either to a department or to a user, never to both.
 */
@Entity
@Table(name = "ORG_STRUCTURE")
@Getter
@Setter
public class OrgStructure extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "PARENT_ID")
	private OrgStructure parent;

	@Enumerated(EnumType.STRING)
	@Column(name = "TYPE")
	private OrgStructureType type;

	/** Filled for {@link OrgStructureType#DEPT} nodes only, {@link #user} is null for them. */
	@ManyToOne
	@JoinColumn(name = "DEPT_ID")
	private Dept dept;

	/** Filled for {@link OrgStructureType#USER} nodes only, {@link #dept} is null for them. */
	@ManyToOne
	@JoinColumn(name = "USER_ID")
	private User user;

	/**
	 * Name of the referenced department or user. Denormalized on purpose: values of two tables are
	 * mixed into one column, and only a copy in the node itself can be indexed. Values that belong to
	 * a single table unambiguously, like {@link Dept#getCode()} or {@link User#getLogin()}, are searched
	 * through the join and need no copy at all.
	 * <p>
	 * Three ways to make such a mixed value searchable, measured on 1M nodes:
	 * <ul>
	 *     <li>this column: search ~5 ms by a gin index, sorting ~0.1 ms by a btree one,
	 *     price - the value is updated on every change;</li>
	 *     <li>{@code @Formula("coalesce((select ... from users u where u.id = USER_ID),
	 *     (select ... from dept d where d.id = DEPT_ID))")}: search ~2800 ms, sorting ~1900 ms,
	 *     no index fits - the subqueries are correlated, so the name is read for every row;</li>
	 *     <li>{@code @SearchParameter(suppressProcess = true)} with a specification of uncorrelated
	 *     subqueries {@code user.id in (select id from users where name like ?)
	 *     or dept.id in (select id from dept where name like ?)}: search ~230 ms by the indexes of
	 *     those tables, sorting is not available at all - there is no entity field to sort by.</li>
	 * </ul>
	 * Up to about 10k nodes any of them is fine, above that the copy pays off.
	 */
	@Column(name = "FULL_NAME")
	private String fullName;

}

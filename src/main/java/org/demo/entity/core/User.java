/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.demo.entity.core;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.model.core.entity.BaseEntity;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.envers.NotAudited;

/**
 * User
 */
/*@Audited* is not audited by default in 4.0.0 cxbox major. Please audit on project level*/
@Entity
@Table(name = "users") // users, а не user, т.к. это служебное слово oracle
@Getter
@Setter
public class User extends BaseEntity {

	private String login;

	private String firstName;

	private String lastName;

	@ManyToOne
	@Fetch(FetchMode.JOIN)
	@JoinColumn(name = "dept_id")
	private Department department;

	@Deprecated
	@Column(name = "internal_role_cd")
	private LOV internalRole;

	@NotAudited
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
	private List<UserRole> userRoleList;

	public String getFullName() {
		StringBuilder sB = new StringBuilder();
		if (lastName != null) {
			sB.append(lastName);
			if (firstName != null) {
				sB.append(" ");
			}
		}
		if (firstName != null) {
			sB.append(firstName);
		}
		return sB.toString();
	}

	public String getUserNameInitials() {
		StringBuilder sB = new StringBuilder();
		if (lastName != null) {
			sB.append(lastName);
			if (firstName != null) {
				sB.append(" ");
			}
		}
		if (firstName != null) {
			sB.append(StringUtils.left(firstName, 1).toUpperCase() + ".");
		}
		return sB.toString();
	}

	public String getUserNameInitialsWithoutSpace() {
		StringBuilder sB = new StringBuilder();
		if (lastName != null) {
			sB.append(lastName);
			if (firstName != null) {
				sB.append(" ");
			}
		}
		if (firstName != null) {
			sB.append(StringUtils.left(firstName, 1).toUpperCase() + ".");
		}
		return sB.toString();
	}

}

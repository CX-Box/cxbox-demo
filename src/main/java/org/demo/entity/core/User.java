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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Getter;
import lombok.Setter;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.model.core.entity.BaseEntity;
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

	private static final long DEFAULT_DEPARTMENT_ID = 0L;

	private String login;

	private String firstName;

	private String lastName;

	@Deprecated
	@Column(name = "internal_role_cd")
	private LOV internalRole;

	@NotAudited
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
	private List<UserRole> userRoleList;

	public String getFullName() {
		return Stream.of(lastName, firstName)
				.filter(Objects::nonNull)
				.collect(Collectors.joining(" "))
				.trim();
	}

	@Deprecated(forRemoval = true, since = "release 2.0.8")
	public Long getDepartmentId() {
		return DEFAULT_DEPARTMENT_ID;
	}

}

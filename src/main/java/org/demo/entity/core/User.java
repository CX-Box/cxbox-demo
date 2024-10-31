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

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Getter;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.hibernate.envers.NotAudited;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User extends BaseEntity {

	public static final long DEFAULT_DEPARTMENT_ID = 0L;

	private String login;

	private String firstName;

	private String lastName;

	@NotAudited
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
	private List<UserRole> userRoleList;

	@Deprecated(forRemoval = true, since = "4.0.0-M10")
	@Transient
	private Long departmentId = DEFAULT_DEPARTMENT_ID;

	public String getFullName() {
		return Stream.of(lastName, firstName)
				.filter(Objects::nonNull)
				.collect(Collectors.joining(" "))
				.trim();
	}

}

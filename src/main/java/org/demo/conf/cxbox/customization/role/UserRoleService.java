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

package org.demo.conf.cxbox.customization.role;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.data.dictionary.DictionaryCache;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.api.exception.ServerException;
import org.cxbox.core.config.properties.UIProperties;
import org.cxbox.model.core.dao.JpaDao;
import org.demo.entity.core.User;
import org.demo.entity.core.UserRole;
import org.demo.entity.core.UserRole_;
import org.demo.entity.core.User_;
import org.hibernate.LockOptions;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserRoleService {

	private final JpaDao jpaDao;

	private final DictionaryCache dictionaryCache;

	private final UIProperties uiProperties;

	/**
	 * Get the main user role (last active role)
	 *
	 * @param user User
	 * @return LOV
	 */
	public Set<String> getMainUserRoleKey(User user) {
		List<UserRole> userRoleList = getListByUser(user);
		if (userRoleList == null) {
			return new HashSet<>();
		}
		var roles = userRoleList.stream()
				.map(UserRole::getInternalRoleCd)
				.collect(Collectors.toSet());
		if (uiProperties.isMultiRoleEnabled()) {
			return roles;
		} else {
			return Optional.ofNullable(userRoleList.stream()
							.filter(UserRole::getMain)
							.map(UserRole::getInternalRoleCd)
							.findFirst()
							.orElse(roles.stream().findFirst().orElse(null)))
					.map(Set::of)
					.orElse(new HashSet<>());
		}
	}

	/**
	 * Refresh the list of user roles
	 *
	 * @param userId User
	 * @param intUserRoleKeyList List of roles based on ESK groups
	 */
	public void upsertUserRoles(Long userId, List<String> intUserRoleKeyList) {
		updateUserRoles(jpaDao.findById(User.class, userId), intUserRoleKeyList);
	}

	/**
	 * Get the main role based on ESK groups
	 *
	 * @param intUserRoleKeyList List of roles based on ESK groups
	 * @return String
	 */
	public String getMainUserRole(List<String> intUserRoleKeyList) {
		Map<String, Integer> roleKeyOrderMap = dictionaryCache.getAll("INTERNAL_ROLE").stream()
				.collect(Collectors.toMap(SimpleDictionary::getKey, SimpleDictionary::getDisplayOrder));
		String mainUserRole = null;
		if (intUserRoleKeyList != null) {
			mainUserRole = intUserRoleKeyList.stream()
					.filter(Objects::nonNull)
					.filter(userRole -> !userRole.startsWith("OPT_"))
					.filter(roleKeyOrderMap::containsKey)
					.min(Comparator.comparingInt(roleKeyOrderMap::get)).orElse(null);
		}
		return mainUserRole;
	}

	/**
	 * Get a list of user roles available for selection
	 *
	 * @param user User
	 * @return List
	 */
	public List<SimpleDictionary> getUserRoles(User user) {

		Map<String, String> dictRoleMap = dictionaryCache.getAll("INTERNAL_ROLE").stream()
				.collect(Collectors.toMap(SimpleDictionary::getKey, SimpleDictionary::getValue));

		List<UserRole> userRoleList = getListByUser(user);

		if (userRoleList == null || userRoleList.isEmpty()) {
			throw new ServerException(String.format("User [id=%s] has no roles!", user.getId()));
		}

		return userRoleList.stream()
				.filter(userRole -> userRole.getActive() && !userRole.getInternalRoleCd().contains("OPT_"))
				.map(userRole -> {
					String key = userRole.getInternalRoleCd();
					String value = dictRoleMap.get(key);
					return value != null ? new SimpleDictionary(key, value) : new SimpleDictionary(key, key);
				}).collect(Collectors.toList());
	}

	/**
	 * Update main role (main role is last role selected by user)
	 *
	 * @param user user
	 * @param mainUserRole main role
	 */
	public void updateMainUserRole(User user, String mainUserRole) {
		List<UserRole> userRoleList = getListByUser(user);
		if (userRoleList != null && mainUserRole != null) {
			userRoleList.stream()
					.filter(UserRole::getMain)
					.findFirst()
					.ifPresent(mur -> mur.setMain(false));
			userRoleList.stream()
					.filter(ur -> ur.getInternalRoleCd().equals(mainUserRole))
					.findFirst()
					.ifPresent(ur -> ur.setMain(true));
		}
	}

	/**
	 * Update the list of user roles (including OPT_% options)
	 *
	 * @param user user
	 * @param intUserRoleKeyList list of role codes from ESK
	 * @return List
	 */
	private List<UserRole> updateUserRoles(User user, List<String> intUserRoleKeyList) {
		List<UserRole> userRoleList = getListByUser(user);
		List<UserRole> activeUserRoleList = new ArrayList<>();
		for (UserRole userRole : userRoleList) {
			if (intUserRoleKeyList.contains(userRole.getInternalRoleCd())) {
				userRole.setActive(true);
				activeUserRoleList.add(userRole);
			} else {
				userRole.setActive(false);
				userRole.setMain(false);
			}
		}

		List<String> userRoleKeyList = userRoleList.stream()
				.map(userRole -> userRole.getInternalRoleCd())
				.collect(Collectors.toList());

		for (String userRoleKey : intUserRoleKeyList) {
			if (!userRoleKeyList.contains(userRoleKey)) {
				activeUserRoleList.add(createUserRole(user, userRoleKey));
			}
		}

		if (activeUserRoleList.stream().noneMatch(UserRole::getMain)) {
			final String mainUserRole = getMainUserRole(intUserRoleKeyList);
			activeUserRoleList.stream()
					.filter(ur -> ur.getInternalRoleCd().equals(mainUserRole))
					.findFirst()
					.ifPresent(userRole -> userRole.setMain(true));
		}

		return activeUserRoleList;
	}

	private UserRole createUserRole(User user, final String internalRoleCd) {
		jpaDao.lockAndRefresh(user, LockOptions.WAIT_FOREVER);
		UserRole userRole = jpaDao.getSingleResultOrNull(UserRole.class, (root, query, cb) -> cb.and(
				cb.equal(root.get(UserRole_.user), user),
				cb.equal(root.get(UserRole_.internalRoleCd), internalRoleCd)
		));
		if (userRole == null) {
			userRole = new UserRole();
			userRole.setUser(user);
			userRole.setInternalRoleCd(internalRoleCd);
			userRole.setActive(true);
			userRole.setMain(false);
			jpaDao.save(userRole);
		}
		return userRole;
	}

	/**
	 * Get a list of all user roles
	 *
	 * @param user user
	 * @return List
	 */
	private List<UserRole> getListByUser(User user) {
		return jpaDao.getList(
				UserRole.class,
				(root, query, cb) -> cb.equal(root.get(UserRole_.user).get(User_.ID), user.getId())
		);
	}

}

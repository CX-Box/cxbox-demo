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

package org.demo.conf.security.common;

import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.session.CxboxAuthenticationService;
import org.demo.conf.cxbox.customization.role.UserRoleService;
import org.demo.conf.cxbox.customization.role.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CxboxAuthenticationServiceImpl implements CxboxAuthenticationService {

	private final UserService userService;

	private final UserRoleService userRoleService;

	@Override
	public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
		return loadUserByUsername(username, null);
	}

	@SuppressWarnings("java:S5804")
	@Override
	public UserDetails loadUserByUsername(final String username, final Set<String> userRole) throws UsernameNotFoundException {
		final var user = userService.getUserByLogin(username);
		if (user == null) {
			throw new UsernameNotFoundException(username);
		}
		return userService.createUserDetails(
				user,
				userRole == null
						? userRoleService.getMainUserRoleKey(user)
						: userRole
		);

	}





}

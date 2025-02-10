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
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.api.ScreenResponsibilityService;
import org.cxbox.api.data.dictionary.SimpleDictionary;
import org.cxbox.api.service.session.CoreSessionService;
import org.cxbox.api.service.session.IUser;
import org.cxbox.core.config.properties.UIProperties;
import org.cxbox.core.config.properties.WidgetFieldsIdResolverProperties;
import org.cxbox.core.dto.LoggedUser;
import org.cxbox.core.util.session.LoginService;
import org.cxbox.core.util.session.SessionService;
import org.cxbox.meta.metahotreload.conf.properties.MetaConfigurationProperties;
import org.demo.entity.core.User;
import org.demo.repository.core.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

	private final SessionService sessionService;

	private final CoreSessionService coreSessionService;

	private final UserRoleService userRoleService;

	private final UserRepository userRepository;

	private final ScreenResponsibilityService screenResponsibilityService;

	private final MetaConfigurationProperties metaConfigurationProperties;

	private final WidgetFieldsIdResolverProperties widgetFieldsIdResolverProperties;

	private final UIProperties uiProperties;

	private final ApplicationEventPublisher eventPublisher;

	/**
	 * Build info for active session user for specific role
	 *
	 * @param role Requested role
	 * @return LoggedUser User info with settings, supported features, locale and time zone
	 */
	@Override
	@SneakyThrows
	public LoggedUser getLoggedUser(@Nullable String role) {
		LoggedUser result = null;
		Exception exception = null;
		try {
			IUser<Long> user = sessionService.getSessionUser();
			if (role != null) {
				setSessionUserInternalRole(Set.of(role));
			} else if (uiProperties.isMultiRoleEnabled()) {
				setSessionUserInternalRole(userRoleService.getUserRoles(userRepository.getReferenceById(user.getId()))
						.stream()
						.map(SimpleDictionary::getKey)
						.collect(Collectors.toSet()));
			} else {
				setSessionUserInternalRole(Set.of());
			}

			User userEntity = userRepository.findById(user.getId()).orElseThrow();
			var activeUserRole = sessionService.getSessionUserRoles();
			result = LoggedUser.builder()
					.sessionId(sessionService.getSessionId())
					.userId(userEntity.getId())
					.activeRole(activeUserRole.size() == 1 ? activeUserRole.stream().findFirst().orElse(null) : null)
					.roles(userRoleService.getUserRoles(userEntity))
					.screens(screenResponsibilityService.getScreens(user, activeUserRole))
					.userSettingsVersion(null)
					.lastName(userEntity.getLastName())
					.firstName(userEntity.getFirstName())
					.fullName(userEntity.getFullName())
					.featureSettings(this.getFeatureSettings())
					.systemUrl(uiProperties.getSystemUrl())
					.language(LocaleContextHolder.getLocale().getLanguage())
					.timezone(LocaleContextHolder.getTimeZone().getID())
					.devPanelEnabled(metaConfigurationProperties.isDevPanelEnabled())
					.build();
			return result;
		} catch (Exception ex) {
			exception = ex;
			throw ex;
		} finally {
			eventPublisher.publishEvent(new LoginEvent<>(this, result, exception));
		}
	}

	public void setSessionUserInternalRole(Set<String> roles) {
		var userDetails = coreSessionService.getSessionUserDetails(true);
		if (roles == null || roles.isEmpty() || userDetails == null) {
			return;
		}
		User user = userRepository.getById(userDetails.getId());
		userDetails.setUserRoles(roles);
		userRoleService.updateMainUserRole(user, roles.size() == 1 ? roles.stream().findFirst().orElse(null) : null);
	}

	/**
	 * Get available application features, e.g. comments/notification polling or supression of system errors
	 * No implementation is provided by Cxbox UI by default so for now it is considered as a customization joint.
	 *
	 * @return Dictionary of string key and value (boolean)
	 * Following keys were supported historically: FEATURE_COMMENTS, FEATURE_NOTIFICATIONS, FEATURE_HIDE_SYSTEM_ERRORS
	 */
	public Collection<SimpleDictionary> getFeatureSettings() {
		ArrayList<SimpleDictionary> featureSettings = new ArrayList<>();
		featureSettings.add(new SimpleDictionary(
				WidgetFieldsIdResolverProperties.SORT_ENABLED_DEFAULT_PARAM_NAME,
				String.valueOf(widgetFieldsIdResolverProperties.isSortEnabledDefault())
		));
		featureSettings.add(new SimpleDictionary(
				WidgetFieldsIdResolverProperties.FILTER_BY_RANGE_ENABLED_DEFAULT_PARAM_NAME,
				String.valueOf(widgetFieldsIdResolverProperties.isFilterByRangeEnabledDefault())
		));
		featureSettings.add(new SimpleDictionary(
				UIProperties.MULTI_ROLE_ENABLED,
				String.valueOf(uiProperties.isMultiRoleEnabled())
		));
		featureSettings.add(new SimpleDictionary(
				UIProperties.DRILL_DOWN_TOOLTIP_NAME,
				String.valueOf(uiProperties.getDrillDownTooltip())
		));
		featureSettings.add(new SimpleDictionary(
				UIProperties.SIDE_BAR_WORD_BREAK,
				String.valueOf(uiProperties.getSideBarWordBreak())
		));
		return featureSettings;
	}

}

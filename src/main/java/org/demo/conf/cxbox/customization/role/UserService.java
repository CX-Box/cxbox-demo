package org.demo.conf.cxbox.customization.role;

import java.util.Collections;
import java.util.Set;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.service.session.CxboxUserDetails;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import org.demo.entity.core.User;
import org.demo.entity.core.User_;
import org.demo.repository.core.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;

	public User getUserByLogin(String login) {
		return userRepository.findOne(
				(root, cq, cb) -> cb.equal(cb.upper(root.get(User_.login)), login.toUpperCase())
		).orElse(null);
	}

	public CxboxUserDetailsInterface createUserDetails(@NonNull final User user, @NonNull final Set<String> userRole) {
		return CxboxUserDetails.builder()
				.id(user.getId())
				.departmentId(user.getDepartmentId())
				.userRoles(userRole)
				.authorities(Collections.emptySet())
				.build();
	}

}

package org.demo.conf.security.cxboxkeycloak;


import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.api.service.session.CxboxUserDetailsInterface;
import org.springframework.security.core.GrantedAuthority;

@Getter
@Setter
@Accessors(chain = true)
@AllArgsConstructor
@NoArgsConstructor
public class CxboxKeycloakAccount implements CxboxUserDetailsInterface {

	private static final long serialVersionUID = 4714671346784362939L;

	private Long id;

	private String username;

	private String password;

	private LOV userRole;

	private LOV timezone;

	private LOV localeCd;

	private Set<GrantedAuthority> authorities;

	public boolean isAccountNonExpired() {
		return true;
	}

	public boolean isAccountNonLocked() {
		return true;
	}

	public boolean isCredentialsNonExpired() {
		return true;
	}

	public boolean isEnabled() {
		return true;
	}

}
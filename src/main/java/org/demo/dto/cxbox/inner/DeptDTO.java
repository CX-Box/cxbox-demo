package org.demo.dto.cxbox.inner;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.demo.entity.core.Dept;

@Getter
@Setter
@NoArgsConstructor
public class DeptDTO extends DataResponseDTO {

	@SearchParameter(name = "fullName")
	private String fullName;

	@SearchParameter(name = "code")
	private String code;

	public DeptDTO(Dept entity) {
		this.id = entity.getId().toString();
		this.fullName = entity.getFullName();
		this.code = entity.getCode();
	}

}

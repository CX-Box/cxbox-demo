package org.demo.dto.cxbox.anysource;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class ResponsibleDTO extends DataResponseDTO {
	String parentId;
	String departmentName;
	String lastName;
	String firstName;
	String middleName;
	String fullName;
	Boolean isLeaf;
	Long lnkUserDeptId;
}

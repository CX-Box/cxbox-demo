package org.demo.dto.cxbox.inner;

import static java.util.Optional.ofNullable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.core.util.filter.SearchParameter;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.LongValueProvider;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.OrgStructure;
import org.demo.entity.core.Dept;
import org.demo.entity.core.User;
import org.demo.entity.enums.OrgStructureType;

/**
 * Organisational structure node. Used both by the responsible selection popup
 * and by the organisational structure administration screen.
 */
@Getter
@Setter
@NoArgsConstructor
public class OrgStructureDTO extends DataResponseDTO {

	@SearchParameter(name = "parent.id", provider = LongValueProvider.class)
	private Long parentId;

	private String parentName;

	@SearchParameter(name = "type", provider = EnumValueProvider.class)
	private OrgStructureType type;

	private Long deptId;

	private String deptFullName;

	/** Comes from a single table, so it is searched right through the join, without a copy in the node. */
	@SearchParameter(name = "dept.code")
	private String deptCode;

	private Long userId;

	private String userFullName;

	/** Comes from a single table, so it is searched right through the join, without a copy in the node. */
	@SearchParameter(name = "user.login")
	private String userLogin;

	/** Mixes names of two tables, so the node keeps its own denormalized column with its own index. */
	@SearchParameter(name = "fullName")
	private String fullName;

	private Boolean isLeaf;

	public OrgStructureDTO(OrgStructure entity) {
		this.id = entity.getId().toString();
		this.parentId = ofNullable(entity.getParent()).map(BaseEntity::getId).orElse(null);
		this.parentName = ofNullable(entity.getParent()).map(OrgStructure::getFullName).orElse(null);
		this.type = entity.getType();
		this.deptId = ofNullable(entity.getDept()).map(BaseEntity::getId).orElse(null);
		this.deptFullName = ofNullable(entity.getDept()).map(Dept::getFullName).orElse(null);
		this.deptCode = ofNullable(entity.getDept()).map(Dept::getCode).orElse(null);
		this.userId = ofNullable(entity.getUser()).map(BaseEntity::getId).orElse(null);
		this.userFullName = ofNullable(entity.getUser()).map(User::getFullName).orElse(null);
		this.userLogin = ofNullable(entity.getUser()).map(User::getLogin).orElse(null);
		this.fullName = entity.getFullName();
		this.isLeaf = OrgStructureType.USER.equals(entity.getType());
	}

}

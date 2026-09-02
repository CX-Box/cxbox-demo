package org.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;

@Entity
@Table(name = "LNK_DEPT_USER")
@Getter
@Setter
public class LnkDeptUser extends BaseEntity {

	@Column(name = "DEPT_ID")
	private Long deptId;

	@Column(name = "USER_ID")
	private Long userId;
}
package org.demo.repository.projection;


public record DepartmentUserPrj(
		String id,
		String parentId,
		String departmentName,
		String lastName,
		String firstName,
		String fullName,
		Boolean isLeaf,
		Long lnk_user_dept_id
) { }
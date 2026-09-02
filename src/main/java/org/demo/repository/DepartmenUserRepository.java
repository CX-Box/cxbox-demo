package org.demo.repository;

import java.util.List;
import org.demo.entity.core.Department;
import org.demo.repository.projection.DepartmentUserPrj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmenUserRepository extends JpaRepository<Department, Long>, JpaSpecificationExecutor<Department> {

	String BASE_SELECT = """
			    SELECT
			        CONCAT(mydept.id, '-', COALESCE(u.id, 0)),
			        CASE WHEN mydept.parentId IS NOT NULL
			             THEN CONCAT(mydept.parentId, '-', COALESCE(parentUser.id, 0))
			             ELSE NULL
			        END,
			        mydept.departmentName,
			        u.lastName,
			        u.firstName,
			        CONCAT(u.lastName, ' ', u.firstName),
			        CASE WHEN mydept.parentId IS NULL THEN FALSE ELSE TRUE END,
			        lnk.id
			    FROM Department mydept
			    LEFT JOIN mydept.userList u
			    LEFT JOIN Department parentDept ON parentDept.id = mydept.parentId
			    LEFT JOIN parentDept.userList parentUser ON parentUser.id = 0
			    LEFT JOIN LnkDeptUser lnk ON lnk.deptId = mydept.id AND lnk.userId = u.id
			""";

	String ORDER_BY = " ORDER BY mydept.id, u.id ";
	String OFFSET_LIMIT = " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY ";

	@Query(BASE_SELECT + ORDER_BY + OFFSET_LIMIT)
	List<DepartmentUserPrj> allDepartmentUsers(@Param("offset") int offset, @Param("limit") int limit);

	@Query(BASE_SELECT + " WHERE (CASE WHEN mydept.parentId IS NULL THEN FALSE ELSE TRUE END) = :isLeaf " + ORDER_BY
			+ OFFSET_LIMIT)
	List<DepartmentUserPrj> allDepartmentUsersisLeaf(@Param("offset") int offset, @Param("limit") int limit,
			@Param("isLeaf") boolean isLeaf);

	@Query(BASE_SELECT + " WHERE mydept.id = :deptId " + ORDER_BY + OFFSET_LIMIT)
	List<DepartmentUserPrj> allDepartmentUsersDeptId(@Param("offset") int offset, @Param("limit") int limit,
			@Param("deptId") Long deptId);

	@Query(BASE_SELECT + " WHERE mydept.parentId = :parentId " + ORDER_BY + OFFSET_LIMIT)
	List<DepartmentUserPrj> allDepartmentUsersParentId(@Param("offset") int offset, @Param("limit") int limit,
			@Param("parentId") Long parentId);

}
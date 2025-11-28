package org.demo.repository;

import java.util.Set;
import org.demo.entity.RequestRegulatorEmployeeLinkBase;
import org.demo.entity.dictionary.EmployeeRequestRegulatorRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestRegulatorEmployeeLinkRepoBase extends JpaRepository<RequestRegulatorEmployeeLinkBase, Long>,
		JpaSpecificationExecutor<RequestRegulatorEmployeeLinkBase> {

	@Query(
			"""
			Select c.employeeRoleCd
			From RequestRegulatorEmployeeLinkBase c
			"""
	)
	Set<EmployeeRequestRegulatorRole> findRequest();

	@Query(
			"""
			Select employeeRoleCd
			From RequestRegulatorEmployeeLinkBase 
						 Where employeeEmail!=null 
									 and employeeRoleCd in (:roles)
			"""
	)
	Set<EmployeeRequestRegulatorRole> findRequest1(Set<EmployeeRequestRegulatorRole> roles);

	@Query(
			"""
			Select 1
			From RequestRegulatorEmployeeLinkBase c
						 Where c.employeeEmail!=null 
									 and c.employeeRoleCd in (:roles)
			"""
	)
	Set<Long> findRequest2(Set<EmployeeRequestRegulatorRole> roles);

	//Select new org.demo.entity.dictionary.EmployeeRequestRegulatorRole(c.employeeRoleCd) From RequestRegulatorEmployeeLinkBase c
	// Where c.employeeEmail != null and c.employeeRoleCd in (:roles)
}

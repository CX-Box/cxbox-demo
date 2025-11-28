package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.io.Serial;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.cxbox.dictionary.hibernate.DictionaryType;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.dictionary.EmployeeRequestRegulatorRole;
import org.hibernate.annotations.Type;

@Setter
@Getter
@Entity
@Table(name = "REQUEST_REGULATOR_EMPLOYEE_LINK_BASE")
@SuperBuilder(toBuilder = true)
public class RequestRegulatorEmployeeLinkBase extends BaseEntity {

	@Serial
	private static final long serialVersionUID = 1L;

	@Type(DictionaryType.class)
	@Column(name = "EMPLOYEE_ROLE_CD")
	private EmployeeRequestRegulatorRole employeeRoleCd;

	@Column(name = "EMPLOYEE_EMAIL")
	private String employeeEmail;

}

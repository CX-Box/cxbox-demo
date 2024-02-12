package org.demo.microservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.cxbox.model.core.entity.BaseEntity;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "t_list_of_values")
public class ListOfValues extends BaseEntity {

	@Column(name = "value")
	private String value;

	@Column(name = "description_text")
	private String descriptionText;

	@Column(name = "type_name")
	private String typeName;

	@Column(name = "code")
	private String code;

	@Column(name = "order_by")
	private int orderBy;

	@Column(name = "inactive_flag")
	private boolean inactiveFlag;

	@Column(name = "external_code")
	private String externalCode;

	@Column(name = "additional_parameter_1")
	private String additionalParameter1;


	@Column(name = "additional_parameter_2")
	private String additionalParameter2;

	@ManyToOne
	@JoinColumn(name = "primary_child_id")
	private ListOfValues primaryChild;

	@JsonIgnore
	@ToString.Exclude
	@OneToMany(mappedBy = "parentLov", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<LovHierarchy> childs = new ArrayList<>();

	@JsonIgnore
	@ToString.Exclude
	@OneToMany(mappedBy = "childLov", cascade = CascadeType.REMOVE, orphanRemoval = true)
	private List<LovHierarchy> parents = new ArrayList<>();

	public void addHierarchiesByParentId(final LovHierarchy hierarchy) {
		hierarchy.setParentLov(this);
		childs.add(hierarchy);
	}

}

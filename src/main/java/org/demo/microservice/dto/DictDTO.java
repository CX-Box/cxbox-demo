package org.demo.microservice.dto;

import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.demo.core.querylang.common.SearchParameter;

@Getter
@Setter
@ToString
@SuperBuilder
@NoArgsConstructor
public class DictDTO implements Serializable {

	private String id;

	@SearchParameter(name = "primaryChild.id")
	private Integer primaryChildId;

	@SearchParameter(name = "primaryChild.code")
	private String primaryChildCode;

	@SearchParameter(name = "childs.childLov.code")
	private String childs;

	@NotBlank(message = "Поле value не должно быть пустым")
	private String value;

	private String descriptionText;

	@NotBlank(message = "Поле typeName не должно быть пустым")
	private String typeName;

	@NotBlank(message = "Поле code не должно быть пустым")
	private String code;

	private Integer orderBy;

	@Builder.Default
	@NotBlank(message = "Поле inactiveFlag не должно быть пустым")
	private Boolean inactiveFlag = false;

	private String externalCode;

	private String additionalParameter1;

	private String additionalParameter2;

	private LocalDateTime lastUpdate;

}
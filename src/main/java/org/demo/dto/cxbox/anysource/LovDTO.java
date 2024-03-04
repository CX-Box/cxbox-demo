package org.demo.dto.cxbox.anysource;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.demo.microservice.dto.DictDTO;

@Getter
@Setter
@NoArgsConstructor
public class LovDTO extends DataResponseDTO {

	private String value;

	private String descriptionText;

	private String typeName;

	private String code;

	private Integer orderBy;

	private Boolean inactiveFlag;

	private String externalCode;

	private String additionalParameter1;

	private String additionalParameter2;

	public LovDTO(final DictDTO entity) {

		this.id = entity.getId();
		this.value = entity.getValue();
		this.descriptionText = entity.getDescriptionText();
		this.typeName = entity.getTypeName();
		this.code = entity.getCode();
		this.orderBy = entity.getOrderBy();
		this.inactiveFlag = entity.getInactiveFlag();
		this.externalCode = entity.getExternalCode();
		this.additionalParameter1 = entity.getAdditionalParameter1();
		this.additionalParameter2 = entity.getAdditionalParameter2();
	}

}

package org.demo.microservice.service;

import java.util.Optional;
import java.util.stream.Collectors;
import lombok.NonNull;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.microservice.dto.DictDTO;
import org.demo.microservice.entity.ListOfValues;
import org.springframework.stereotype.Component;

@Component
public class LovMapper {

	public DictDTO toDto(@NonNull ListOfValues lov) {
		DictDTO.DictDTOBuilder<?, ?> dict = DictDTO.builder();
		if (lov.getId() != null) {
			dict.id(String.valueOf(lov.getId()));
		}
		dict
				.primaryChildId(lovPrimaryChildId(lov))
				.lastUpdate(lov.getUpdatedDate())
				.primaryChildCode(lovPrimaryChildCode(lov))
				.value(lov.getValue())
				.descriptionText(lov.getDescriptionText())
				.typeName(lov.getTypeName())
				.code(lov.getCode())
				.orderBy(lov.getOrderBy())
				.inactiveFlag(lov.isInactiveFlag())
				.externalCode(lov.getExternalCode())
				.additionalParameter1(lov.getAdditionalParameter1())
				.additionalParameter2(lov.getAdditionalParameter2())
				.childs(concatChilds(lov));

		return dict.build();
	}

	public ListOfValues newEntityByDto(String id, DictDTO dict) {
		if (id == null && dict == null) {
			return null;
		}
		ListOfValues lov = new ListOfValues();
		if (id != null) {
			lov.setId(Long.parseLong(id));
		}
		return getListOfValues(lov, dict);
	}

	public ListOfValues updateEntityByDto(ListOfValues lov, DictDTO dict) {
		return getListOfValues(lov, dict);
	}

	private ListOfValues getListOfValues(ListOfValues lov, DictDTO dict) {
		if (dict == null) {
			return lov;
		}
		if (dict.getOrderBy() != null) {
			lov.setOrderBy(dict.getOrderBy());
		}
		if (dict.getInactiveFlag() != null) {
			lov.setInactiveFlag(dict.getInactiveFlag());
		}
		lov
				.setValue(dict.getValue())
				.setDescriptionText(dict.getDescriptionText())
				.setTypeName(dict.getTypeName())
				.setCode(dict.getCode())
				.setExternalCode(dict.getExternalCode())
				.setAdditionalParameter1(dict.getAdditionalParameter1())
				.setAdditionalParameter2(dict.getAdditionalParameter2());
		return lov;
	}

	private Integer lovPrimaryChildId(ListOfValues lov) {
		return Optional.ofNullable(lov).map(ListOfValues::getPrimaryChild).map(BaseEntity::getId).map(Long::intValue).orElse(null);
	}

	private String lovPrimaryChildCode(ListOfValues lov) {
		return Optional.ofNullable(lov).map(ListOfValues::getPrimaryChild).map(ListOfValues::getCode).orElse(null);
	}


	public String concatChilds(final ListOfValues lov) {
		return lov.getChilds().stream().filter(e -> e.getChildLov() != null).map(e -> e.getChildLov().getCode())
				.collect(Collectors.joining(","));
	}

}

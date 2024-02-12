package org.demo.microservice.service;

import java.util.stream.Collectors;
import org.demo.microservice.dto.DictDTO;
import org.demo.microservice.entity.ListOfValues;/*
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;*/

/*@Mapper(componentModel = "spring")*/
public interface LovMapper {

	/*@Mapping(target = "id", source = "lov.id")
	@Mapping(target = "lastUpdate", source = "lov.lastUpdate")
	@Mapping(target = "primaryChildId", source = "lov.primaryChild.id")
	@Mapping(target = "primaryChildCode", source = "lov.primaryChild.code")
	@Mapping(target = "childs", expression = "java(concatChilds(lov))")*/
	DictDTO toDto(final ListOfValues lov);

	/*@Mapping(target = "childs", ignore = true)
	@Mapping(target = "parents", ignore = true)*/
	ListOfValues lovDataDtoToListOfValues(final DictDTO lov);

	/*@Mapping(target = "id", source = "id")
	@Mapping(target = "childs", ignore = true)
	@Mapping(target = "parents", ignore = true)*/
	ListOfValues newEntityByDto(final String id, final DictDTO request);

	/*@Mapping(target = "id", ignore = true)
	@Mapping(target = "childs", ignore = true)
	@Mapping(target = "parents", ignore = true)*/
	ListOfValues updateEntityByDto(/*@MappingTarget */final ListOfValues listOfValues, final DictDTO request);

	default String concatChilds(final ListOfValues lov) {
		return lov.getChilds().stream().filter(e -> e.getChildLov() != null).map(e -> e.getChildLov().getCode())
				.collect(Collectors.joining(","));
	}

}

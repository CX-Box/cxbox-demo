package org.demo.microservice.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.demo.core.querylang.common.FilterParameters;
import org.demo.microservice.dto.DictDTO;
import org.demo.microservice.entity.ListOfValues;
import org.demo.microservice.repository.LovDataRepository;
import org.demo.microservice.service.LovMapper;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


//TODO move Transactional to impl-service
@Transactional
@RestController
@RequiredArgsConstructor
@RequestMapping("/lov")
public class LovController /*implements QueryLanguageController<DictDTO, Long>*/ {

	private final LovDataRepository lovDataRepository;

	private final LovMapper lovMapper;

	//	@Override
	@GetMapping("/{id}")
	public ResponseEntity<DictDTO> getOne(@PathVariable final Long id) {
		return ResponseEntity.ok().body(lovDataRepository.findById(id).map(lovMapper::toDto).orElse(null));
	}

	//	@Override
	@GetMapping
	public ResponseEntity<Page<DictDTO>> getAll(@ParameterObject final Pageable pageable,
			final FilterParameters<DictDTO> parameters) {
		final var specification = lovDataRepository.getSpecification(parameters, DictDTO.class);
		final var entityPageable = lovDataRepository.getEntityPageable(pageable, DictDTO.class);
		return ResponseEntity.ok().body(lovDataRepository.findAll(specification, entityPageable).map(lovMapper::toDto));
	}

	//	@Override
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable final Long id) {
		//TODO проверка на то, что справочник деактивирован
		lovDataRepository.deleteById(id);
		return ResponseEntity.ok().build();
	}

	/**
	 * @param request (id must be empty)
	 * @return dto with filled id and optionally updated fields (accordingly to business logic)
	 */
	//	@Override
	@PostMapping
	public ResponseEntity<DictDTO> create(@RequestBody final DictDTO request) {
		if (request.getId() != null) {
			throw new IllegalArgumentException("Id must be null for creation process");
		}
		return ResponseEntity.ok().body(lovMapper.toDto(lovDataRepository.save(lovMapper.newEntityByDto(null, request))));
	}

	/**
	 * @param request (id mustn't be empty)
	 * @return dto with filled id and optionally updated fields (accordingly to business logic)
	 */
	//	@Override
	@PutMapping
	public ResponseEntity<DictDTO> update(@RequestBody final DictDTO request) {
		if (request.getId() == null) {
			throw new IllegalArgumentException("Id mustn't be null for update process");
		}
		//TODO id convert long
		final ListOfValues entity = lovMapper.updateEntityByDto(
				lovDataRepository.findById(request.getId()).orElseThrow(),
				request
		);
		return ResponseEntity.ok().body(lovMapper.toDto(lovDataRepository.save(entity)));
	}

}

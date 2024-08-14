package org.demo.testforilia.bc3;

import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.cxbox.model.core.entity.BaseEntity_;

import org.demo.testforilia.bc1.MyEntity1222;
import org.demo.testforilia.bc1.MyEntity1222Repository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class MyExample1224Service extends VersionAwareResponseService<MyExample1224DTO, MyEntity1224> {

	private final MyEntity1224Repository repository;

	private final MyEntity1222Repository repository122;

	public MyExample1224Service(MyEntity1224Repository repository, MyEntity1222Repository repository122) {
		super(MyExample1224DTO.class, MyEntity1224.class, null, MyExample1224Meta.class);
		this.repository = repository;
		this.repository122 = repository122;
	}
	@Override
	protected Specification<MyEntity1224> getParentSpecification(BusinessComponent bc) {
		return (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(root.get(MyEntity1224_.customFieldEntity).get(BaseEntity_.id), bc.getParentIdAsLong())
		);

	}
	@Override
	protected CreateResult<MyExample1224DTO> doCreateEntity(MyEntity1224 entity, BusinessComponent bc) {
		MyEntity1222 myEntity1222= repository122.findById(bc.getParentIdAsLong()).orElse(null);
		entity.setCustomFieldEntity(myEntity1222);
		repository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<MyExample1224DTO> doUpdateEntity(MyEntity1224 entity, MyExample1224DTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(MyExample1224DTO_.customField)) {
			entity.setCustomField(data.getCustomField());
		}
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public Actions<MyExample1224DTO> getActions() {
		return Actions.<MyExample1224DTO>builder()
				.newAction()
				.action("save", "save")
				.add()
				.create()
				.add()
				.delete()
				.add()
				.build();
	}


}


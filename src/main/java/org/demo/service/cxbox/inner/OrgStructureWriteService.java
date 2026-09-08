package org.demo.service.cxbox.inner;

import static org.demo.dto.cxbox.inner.OrgStructureDTO_.deptId;
import static org.demo.dto.cxbox.inner.OrgStructureDTO_.parentId;
import static org.demo.dto.cxbox.inner.OrgStructureDTO_.type;
import static org.demo.dto.cxbox.inner.OrgStructureDTO_.userId;

import static java.util.Optional.ofNullable;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.service.action.Actions;
import org.demo.dto.cxbox.inner.OrgStructureDTO;
import org.demo.entity.OrgStructure;
import org.demo.entity.core.Dept;
import org.demo.entity.core.User;
import org.demo.entity.enums.OrgStructureType;
import org.demo.repository.DeptRepository;
import org.demo.repository.OrgStructureRepository;
import org.demo.repository.core.UserRepository;
import org.springframework.stereotype.Service;

/**
 * Org structure tree editing, used by the administration screen.
 */
@SuppressWarnings({"java:S3252", "java:S1186", "java:S1170"})
@Service
@RequiredArgsConstructor
public class OrgStructureWriteService extends VersionAwareResponseService<OrgStructureDTO, OrgStructure> {

	private final OrgStructureRepository orgStructureRepository;

	private final DeptRepository deptRepository;

	private final UserRepository userRepository;

	@Getter(onMethod_ = @Override)
	private final Class<OrgStructureWriteMeta> meta = OrgStructureWriteMeta.class;


	@Override
	protected CreateResult<OrgStructureDTO> doCreateEntity(OrgStructure entity, BusinessComponent bc) {
		entity.setType(OrgStructureType.DEPT);
		orgStructureRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<OrgStructureDTO> doUpdateEntity(OrgStructure entity, OrgStructureDTO data,
			BusinessComponent bc) {

		setMappedIfChanged(
				data, parentId, entity::setParent,
				id -> id != null ? orgStructureRepository.getReferenceById(id) : null
		);
		setIfChanged(data, type, entity::setType);
		setMappedIfChanged(
				data, deptId, entity::setDept,
				id -> id != null ? deptRepository.getReferenceById(id) : null
		);
		setMappedIfChanged(
				data, userId, entity::setUser,
				id -> id != null ? userRepository.getReferenceById(id) : null
		);

		// a node keeps only the reference matching its type
		if (OrgStructureType.USER.equals(entity.getType())) {
			entity.setDept(null);
			entity.setFullName(ofNullable(entity.getUser()).map(User::getFullName).orElse(null));
		} else {
			entity.setUser(null);
			entity.setFullName(ofNullable(entity.getDept()).map(Dept::getFullName).orElse(null));
		}

		orgStructureRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO<OrgStructureDTO> deleteEntity(BusinessComponent bc) {
		super.deleteEntity(bc);
		return new ActionResultDTO<>();
	}

	@Override
	public Actions<OrgStructureDTO> getActions() {
		return Actions.<OrgStructureDTO>builder()
				.create(crt -> crt.text("Add"))
				.save(sv -> sv.text("Save"))
				.delete(dlt -> dlt.text("Delete"))
				.cancelCreate(ccr -> ccr.text("Cancel").available(bc -> true))
				.build();
	}

}

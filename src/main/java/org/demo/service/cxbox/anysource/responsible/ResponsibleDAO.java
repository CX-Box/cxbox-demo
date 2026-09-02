package org.demo.service.cxbox.anysource.responsible;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.anysource.ResponsibleDTO;
import org.demo.repository.DepartmenUserRepository;
import org.demo.repository.projection.DepartmentUserPrj;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResponsibleDAO extends AbstractAnySourceBaseDAO<ResponsibleDTO> {

	private final DepartmenUserRepository repository;
	private static final int DEFAULT_PAGE = 1;
	private static final int DEFAULT_LIMIT = 20;

	@Override
	public String getId(ResponsibleDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(String id, ResponsibleDTO entity) {
		entity.setId(id);
	}

	@Override
	public ResponsibleDTO getByIdIgnoringFirstLevelCache(BusinessComponent bc) {
		String id = bc.getId();
		if (id == null || !id.contains("-")) {
			return null;
		}

		String departmentId = extractDepartmentId(id);
		return getData(bc, departmentId).stream()
				.filter(dto -> Objects.equals(dto.getId(), id))
				.findFirst()
				.orElse(null);
	}

	@Override
	public Page<ResponsibleDTO> getList(BusinessComponent bc, QueryParameters queryParameters) {
		List<ResponsibleDTO> data = getData(bc, null);
		return new PageImpl<>(data);
	}

	@Override
	public ResponsibleDTO create(BusinessComponent bc, ResponsibleDTO entity) {
		throw new UnsupportedOperationException("Create operation is not supported");
	}

	@Override
	public ResponsibleDTO update(BusinessComponent bc, ResponsibleDTO entity) {
		throw new UnsupportedOperationException("Create operation is not supported");
	}

	@Override
	public void delete(BusinessComponent bc) {
		throw new UnsupportedOperationException("Create operation is not supported");
	}


	public List<ResponsibleDTO> getData(BusinessComponent bc, String deptId) {
		PaginationParams pagination = extractPaginationParams(bc);
		FilterParams filters = extractFilterParams(bc);

		List<DepartmentUserPrj> entities = getData(pagination, filters, deptId);

		return entities.stream()
				.map(this::toDTO)
				.toList();
	}

	private PaginationParams extractPaginationParams(BusinessComponent bc) {
		String pageStr = bc.getParameters().getParameter("_page");
		String limitStr = bc.getParameters().getParameter("_limit");

		int page = parseOrDefault(pageStr, DEFAULT_PAGE);
		int limit = parseOrDefault(limitStr, DEFAULT_LIMIT);
		int offset = (page - 1) * limit;

		return new PaginationParams(offset, limit);
	}

	private FilterParams extractFilterParams(BusinessComponent bc) {
		String isLeafParam = bc.getParameters().getParameter("parentId.specified");
		String parentIdParam = bc.getParameters().getParameter("parentId.equals");

		return new FilterParams(
				isLeafParam != null ? Boolean.parseBoolean(isLeafParam) : null,
				parentIdParam
		);
	}

	private List<DepartmentUserPrj> getData(PaginationParams pagination,
			FilterParams filters,
			String deptId) {
		int offset = pagination.offset();
		int limit = pagination.limit();


		if (deptId != null) {
			return repository.allDepartmentUsersDeptId(offset, limit, Long.valueOf(deptId));
		}

		if (filters.isLeaf() != null) {
			return repository.allDepartmentUsersisLeaf(offset, limit, filters.isLeaf());
		}

		if (filters.parentId() != null && !filters.parentId().isEmpty()) {
			String parentIdExtract = extractDepartmentId(filters.parentId());
			return	repository.allDepartmentUsersParentId(offset, limit, Long.valueOf(parentIdExtract));
		}

		return repository.allDepartmentUsers(offset, limit);
	}

	private ResponsibleDTO toDTO(DepartmentUserPrj entity) {
		ResponsibleDTO responsibleDTO = new ResponsibleDTO()
				.setDepartmentName(entity.departmentName())
				.setParentId(String.valueOf(entity.parentId()))
				.setIsLeaf(entity.isLeaf())
				.setLastName(entity.lastName())
				.setFullName(entity.fullName())
				.setFirstName(entity.firstName());
		responsibleDTO.setId(String.valueOf(entity.id()));
		return responsibleDTO;
	}

	private int parseOrDefault(String value, int defaultValue) {
		if (value == null || value.isBlank()) {
			return defaultValue;
		}
		try {
			return Integer.parseInt(value.trim());
		} catch (NumberFormatException e) {
			return defaultValue;
		}
	}

	private String extractDepartmentId(String compositeId) {
		if (compositeId == null || !compositeId.contains("-")) {
			return compositeId;
		}
		return compositeId.split("-")[0];
	}

	private record PaginationParams(int offset, int limit) {}

	private record FilterParams(Boolean isLeaf, String parentId) {}
}

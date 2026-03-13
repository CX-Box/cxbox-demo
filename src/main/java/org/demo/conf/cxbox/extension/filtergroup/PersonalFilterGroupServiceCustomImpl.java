package org.demo.conf.cxbox.extension.filtergroup;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import lombok.AllArgsConstructor;
import org.cxbox.core.exception.BusinessException;
import org.cxbox.meta.data.FilterGroupDTO;
import org.cxbox.meta.entity.FilterGroup;
import org.cxbox.meta.filterGroup.PersonalFilterGroupService;
import org.cxbox.meta.filterGroup.PersonalFilterGroupServiceImpl;
import org.cxbox.model.core.dao.JpaDao;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;


@Primary
@Service
@AllArgsConstructor
public class PersonalFilterGroupServiceCustomImpl implements PersonalFilterGroupService {

	private final PersonalFilterGroupServiceImpl personalFilterGroupServiceImpl;

	private final JpaDao jpaDao;

	@Override
	public List<FilterGroupDTO> create(List<FilterGroupDTO> filterGroupDTOList) {
		FilterGroupDTO dto = filterGroupDTOList.stream()
				.filter(Objects::nonNull)
				.findFirst()
				.orElseThrow(() -> new  IllegalArgumentException("FilterGroupDTO list is empty"));

		if (hasDuplicateName(dto)) {
			throw new BusinessException().addPopup(
					"Filter group names must be unique (case-insensitive)"
			);
		}

		return personalFilterGroupServiceImpl.create(filterGroupDTOList);
	}

	@Override
	public void delete(List<Long> ids) {
		personalFilterGroupServiceImpl.delete(ids);
	}

	private boolean hasDuplicateName(FilterGroupDTO dto) {
		String name = dto.getName().toLowerCase(Locale.ROOT);

		return jpaDao.getList(FilterGroup.class).stream()
				.map(FilterGroup::getName)
				.filter(Objects::nonNull)
				.anyMatch(n -> n.equalsIgnoreCase(name));
	}

}

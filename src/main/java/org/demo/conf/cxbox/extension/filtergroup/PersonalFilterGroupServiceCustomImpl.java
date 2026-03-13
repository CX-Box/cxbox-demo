package org.demo.conf.cxbox.extension.filtergroup;

import java.util.List;
import org.cxbox.api.service.tx.TransactionService;
import org.cxbox.core.exception.BusinessException;
import org.cxbox.core.util.session.SessionService;
import org.cxbox.meta.data.FilterGroupDTO;
import org.cxbox.meta.filterGroup.PersonalFilterGroupServiceImpl;
import org.cxbox.model.core.dao.JpaDao;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Primary
@Service
public class PersonalFilterGroupServiceCustomImpl extends PersonalFilterGroupServiceImpl {

	public PersonalFilterGroupServiceCustomImpl(JpaDao jpaDao, SessionService service,
			TransactionService transactionService) {
		super(jpaDao, service, transactionService);
	}

	@Override
	public List<FilterGroupDTO> create(List<FilterGroupDTO> filterGroupDTOList) {
		try {
			return super.create(filterGroupDTOList);
		} catch (DataIntegrityViolationException e) {
			Throwable cause = e.getCause();
			if (cause instanceof ConstraintViolationException violation) {
				if ("bc_filter_groups_unique".equals(violation.getConstraintName())) {
					throw new BusinessException().addPopup(("Названия групп фильтров должны быть уникальными"));
				}
			}
			throw e;
		}
	}


}

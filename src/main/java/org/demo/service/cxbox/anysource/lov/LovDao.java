package org.demo.service.cxbox.anysource.lov;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.microservice.dto.DictDTO;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LovDao extends AbstractAnySourceBaseDAO<DictDTO> implements AnySourceBaseDAO<DictDTO> {

	private final LovClient lovClient;

	@Override
	public String getId(final DictDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final DictDTO entity) {
		entity.setId(id);
	}

	@Override
	public DictDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return lovClient.getOne(bc.getIdAsLong()).getBody();
	}

	@Override
	public void delete(final BusinessComponent bc) {
		lovClient.delete(bc.getIdAsLong());
	}

	@Override
	public Page<DictDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return lovClient.getAll(bc).getBody();
	}

	@Override
	public DictDTO update(BusinessComponent bc, DictDTO entity) {
		lovClient.update(entity);
		return this.getByIdIgnoringFirstLevelCache(bc);
	}

	@Override
	public DictDTO create(final BusinessComponent bc, final DictDTO entity) {
		entity.setId(null); //remove the temporary id (when created, the adjacent system waits empty)
		return Optional.ofNullable(lovClient.create(entity).getBody()).orElseThrow();
	}

}

package org.demo.service.cxbox.anysource.sale;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.entity.Sale;
import org.demo.entity.Sale_;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleClientDAO extends AbstractAnySourceBaseDAO<SaleDTO> {

	private final SaleRepository saleRepository;

	@Override
	public String getId(SaleDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(String id, SaleDTO entity) {
		entity.setId(id);
	}

	@Override
	public SaleDTO getByIdIgnoringFirstLevelCache(BusinessComponent bc) {
		return getAllData(bc, null).stream()
				.filter(e -> e.getId().equals(bc.getIdAsLong()))
				.findFirst().map(SaleDTO::new)
				.orElse(null);
	}

	@Override
	public Page<SaleDTO> getList(BusinessComponent bc, QueryParameters queryParameters) {
		return new PageImpl<>(getAllData(bc, queryParameters).stream()
				.map(SaleDTO::new)
				.toList());
	}

	@Override
	public SaleDTO create(BusinessComponent bc, SaleDTO entity) {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	@Override
	public SaleDTO update(BusinessComponent bc, SaleDTO entity) {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	@Override
	public void delete(BusinessComponent bc) {
		throw new UnsupportedOperationException("Not supported yet.");
	}

	private List<Sale> getAllData(BusinessComponent bc, QueryParameters queryParameters) {
		var params = bc.getParentId().split("_");
		return saleRepository.findAll((root, cq, cb) -> cb.and(
				cb.equal(root.get(Sale_.client).get(BaseEntity_.id), Long.valueOf(params[0])),
				cb.equal(root.get(Sale_.clientSeller).get(BaseEntity_.id), Long.valueOf(params[1]))
		));
	}

}

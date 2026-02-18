package org.demo.service.cxbox.anysource.sale;

import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.dto.cxbox.inner.SaleDTO;
import org.demo.entity.Sale;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
		return saleRepository.findById(bc.getIdAsLong())
				.map(SaleDTO::new)
				.orElse(null);
	}

	@Override
	public Page<SaleDTO> getList(BusinessComponent bc, QueryParameters queryParameters) {
		return getSales(bc, queryParameters).map(SaleDTO::new);
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

	private Page<Sale> getSales(BusinessComponent bc, QueryParameters queryParameters) {
		var ids = bc.getParentId().split("_");
		Long targetId = Long.parseLong(ids[0]);
		Long sourceId = Long.parseLong(ids[1]);
		int pageNumber = queryParameters.getPageNumber();
		int pageSize = queryParameters.getPageSize();
		Pageable pageable = PageRequest.of(pageNumber, pageSize);
		return saleRepository.findAll(saleRepository.findSaleByTargetIdAndSellerId(targetId, sourceId), pageable);
	}

}

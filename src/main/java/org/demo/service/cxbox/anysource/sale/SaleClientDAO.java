package org.demo.service.cxbox.anysource.sale;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.demo.conf.cxbox.extension.relationGraph.dto.GraphEdgeDTO;
import org.demo.entity.Sale;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleClientDAO extends AbstractAnySourceBaseDAO<Sale> {

	private final SaleRepository saleRepository;

	@Override
	public String getId(Sale entity) {
		return Optional.ofNullable(entity.getId()).map(String::valueOf).orElse(null);
	}

	@Override
	public void setId(String id, Sale entity) {
		entity.setId(Long.parseLong(id));
	}

	@Override
	public Sale getByIdIgnoringFirstLevelCache(BusinessComponent bc) {
		return saleRepository.findById(bc.getIdAsLong()).orElse(null);
	}

	@Override
	public Page<Sale> getList(BusinessComponent bc, QueryParameters queryParameters) {
		return getSales(bc, queryParameters);
	}

	@Override
	public Sale create(BusinessComponent bc, Sale entity) {
		throw new UnsupportedOperationException();
	}

	@Override
	public Sale update(BusinessComponent bc, Sale entity) {
		throw new UnsupportedOperationException();
	}

	@Override
	public void delete(BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	private Page<Sale> getSales(BusinessComponent bc, QueryParameters queryParameters) {
		Long targetId = Long.parseLong(GraphEdgeDTO.idToTargetId(bc.getParentId()));
		Long sourceId = Optional.ofNullable(GraphEdgeDTO.idToSourceId(bc.getParentId())).map(Long::parseLong).orElse(null);
		int pageNumber = queryParameters.getPageNumber();
		int pageSize = queryParameters.getPageSize();
		Pageable pageable = PageRequest.of(pageNumber, pageSize);
		return saleRepository.findAll(saleRepository.findSaleByTargetIdAndSellerId(targetId, sourceId), pageable);
	}

}

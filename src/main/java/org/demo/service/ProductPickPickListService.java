package org.demo.service;

import static org.cxbox.api.data.dao.SpecificationUtils.and;

import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.ProductPickDTO_;
import org.demo.entity.MatrixItem;
import org.demo.entity.Product;
import org.demo.entity.enums.MatrixTypeEnum;
import org.demo.repository.MatrixItemRepository;
import org.demo.repository.ProductRepository;
import org.demo.repository.SaleRepository;
import org.demo.service.productEngine.ProductEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;


@Getter
@Service
public class ProductPickPickListService extends
		VersionAwareResponseService<org.demo.dto.ProductPickDTO, Product> {

	@Autowired
	private MatrixItemRepository matrixItemRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private SaleRepository saleRepository;

	@Autowired
	private ProductEngine productEngine;

	public ProductPickPickListService() {
		super(org.demo.dto.ProductPickDTO.class, Product.class, null, ProductPickPickListMeta.class);
	}


	@Override
	protected Specification<Product> getSpecification(BusinessComponent bc) {
		Long calcId = bc.getParentIdAsLong();
		List<MatrixItem> result = productEngine.productEngineRun(productEngine.calcProductMatrixItemQueryParams(calcId, MatrixTypeEnum.Product)).getMatrixItems();
		List<Long> prodIds = result.stream().map(e -> e.getProduct().getId()).collect(Collectors.toList());
		return and(
				getSecuritySpecification(bc.getDescription()),
				getBcSpecification(bc.getDescription()),
				getLinkSpecification(bc)
		).and(ProductRepository.byIdIn(prodIds));
	}





	@Override
	protected CreateResult<org.demo.dto.ProductPickDTO> doCreateEntity(Product entity,
			BusinessComponent bc) {
		return null;
	}

	@Override
	protected ActionResultDTO<org.demo.dto.ProductPickDTO> doUpdateEntity(Product entity,
			org.demo.dto.ProductPickDTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(ProductPickDTO_.productCode)) {
			entity.setProductCode(data.getProductCode());
		}
		return null;
	}


}
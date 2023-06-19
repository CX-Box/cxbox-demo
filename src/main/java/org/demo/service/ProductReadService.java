package org.demo.service;

import com.google.common.collect.ImmutableMap;
import org.demo.conf.cxbox.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.ProductDTO;
import org.demo.dto.ProductDTO_;
import org.demo.entity.Product;
import org.demo.repository.ProductRepository;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.dto.rowmeta.PreAction;
import org.cxbox.core.dto.rowmeta.PreActionType;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.util.session.SessionService;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class ProductReadService extends VersionAwareResponseService<ProductDTO, Product> {

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private SessionService sessionService;

	public ProductReadService() {
		super(ProductDTO.class, Product.class, null, ProductReadMeta.class);
	}

	@Override
	protected CreateResult<ProductDTO> doCreateEntity(Product entity, BusinessComponent bc) {
		productRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						String.format(
								"/screen/product/view/productSelectionMatrixView/%s/%s",
								CxboxRestController.productEdit,
								entity.getId()
						)
				));
	}

	@Override
	protected ActionResultDTO<ProductDTO> doUpdateEntity(Product entity, ProductDTO data, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}


	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}

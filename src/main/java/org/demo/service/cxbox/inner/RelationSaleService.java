
package org.demo.service.cxbox.inner;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.cxbox.api.data.ResultPage;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.demo.dto.cxbox.inner.RelationSaleDTO;
import org.demo.entity.RelationGraph;
import org.demo.entity.RelationGraph_;
import org.demo.entity.enums.TargetNodeType;
import org.demo.repository.RelationGraphRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;


@Getter
@Service
@RequiredArgsConstructor
public class RelationSaleService extends VersionAwareResponseService<RelationSaleDTO, RelationGraph> {

	@Getter(onMethod_ = @Override)
	private final Class<RelationSaleMetaBuilder> meta = RelationSaleMetaBuilder.class;

	private final RelationGraphRepository relationGraphRepository;

	@Override
	protected Specification<RelationGraph> getParentSpecification(BusinessComponent bc) {
		return (root, query, criteriaBuilder) ->
				criteriaBuilder.equal(root.get(RelationGraph_.rootClientId), bc.getParentId());
	}

	@Override
	public RelationSaleDTO getOne(BusinessComponent bc) {
		RelationSaleDTO one = super.getOne(bc);
		if (bc == null || bc.getParentId() == null) {
			return one;
		}
		if (bc.getParentId().equals(one.getTargetNodeId())) {
			one.setTargetNodeType(TargetNodeType.MAIN);
		}
		return one;
	}

	@Override
	public ResultPage<RelationSaleDTO> getList(BusinessComponent bc) {
		ResultPage<RelationSaleDTO> list = super.getList(bc);
		list.getResult().stream()
				.filter(relationSaleDTO -> relationSaleDTO.getTargetNodeId().equals(bc.getParentId()))
				.forEach(p -> p.setTargetNodeType(TargetNodeType.MAIN));
		return list;
	}

	@Override
	protected CreateResult<RelationSaleDTO> doCreateEntity(RelationGraph entity, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	protected ActionResultDTO<RelationSaleDTO> doUpdateEntity(RelationGraph entity, RelationSaleDTO data,
			BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

}
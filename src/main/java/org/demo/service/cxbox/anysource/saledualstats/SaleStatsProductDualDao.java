package org.demo.service.cxbox.anysource.saledualstats;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.controller.param.QueryParameters;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.dao.AnySourceBaseDAO;
import org.cxbox.core.dao.impl.AbstractAnySourceBaseDAO;
import org.cxbox.core.external.core.ParentDtoFirstLevelCache;
import org.demo.dto.cxbox.anysource.SaleProductDualDTO;
import org.demo.dto.cxbox.inner.DashboardFilterDTO_;
import org.demo.entity.dictionary.Product;
import org.demo.entity.enums.FieldOfActivity;
import org.demo.entity.enums.SaleStatus;
import org.demo.repository.SaleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaleStatsProductDualDao extends AbstractAnySourceBaseDAO<SaleProductDualDTO> implements
		AnySourceBaseDAO<SaleProductDualDTO> {

	private final ParentDtoFirstLevelCache parentDtoFirstLevelCache;

	private final SaleRepository saleRepository;

	@Override
	public String getId(final SaleProductDualDTO entity) {
		return entity.getId();
	}

	@Override
	public void setId(final String id, final SaleProductDualDTO entity) {
		entity.setId(id);
	}

	@Override
	public SaleProductDualDTO getByIdIgnoringFirstLevelCache(final BusinessComponent bc) {
		return getStats(bc).stream().filter(s -> Objects.equals(s.getId(), bc.getId())).findFirst().orElse(null);
	}

	@Override
	public void delete(final BusinessComponent bc) {
		throw new IllegalStateException();
	}

	@Override
	public Page<SaleProductDualDTO> getList(final BusinessComponent bc, final QueryParameters queryParameters) {
		return new PageImpl<>(getStats(bc));
	}

	@Override
	public SaleProductDualDTO update(BusinessComponent bc, SaleProductDualDTO entity) {
		throw new IllegalStateException();
	}

	@Override
	public SaleProductDualDTO create(final BusinessComponent bbc, final SaleProductDualDTO entity) {
		throw new IllegalStateException();
	}

	@NonNull
	private List<SaleProductDualDTO> getStats(BusinessComponent bc) {
		var parentField = parentDtoFirstLevelCache.getParentField(DashboardFilterDTO_.fieldOfActivity, bc);
		var filter = Optional.ofNullable(parentField)
				.map(e -> e.getValues().stream()
						.map(value -> FieldOfActivity.getByValue(value.getValue()))
						.collect(Collectors.toSet()))
				.orElse(new HashSet<>());
		filter = filter.isEmpty() ? null : filter;
		var first = saleRepository.getSalesStatsByMonthAndStatus(filter).stream()
				.<SaleProductDualDTO>map(stat -> SaleProductDualDTO.builder()
						.id(stat.id())
						.month(stat.month())
						.year(stat.year())
						.count(stat.count())
						.saleStatus(stat.status())
						.vstamp(0L)
						.color(SaleStatus.CLOSED.equals(stat.status()) ? "#4D83E7" : "#30BA8F")
						.build())
				.toList();
		var second = saleRepository.getSalesByMonthAndProduct(filter).stream()
				.<SaleProductDualDTO>map(stat -> SaleProductDualDTO.builder()
						.id(stat.id())
						.month(stat.month())
						.year(stat.year())
						.sum(stat.sum())
						.productType((Product) stat.product())
						.vstamp(0L)
						.color(Product.EXPERTISE.equals(stat.product()) ? "#5D7092" : "#70925d")
						.build())
				.toList();
		return Stream.concat(first.stream(), second.stream()).toList();
	}


}

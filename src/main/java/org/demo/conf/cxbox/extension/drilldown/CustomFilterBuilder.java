package org.demo.conf.cxbox.extension.drilldown;

import javax.annotation.Nullable;
import lombok.NonNull;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.constgen.DtoField;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.util.filter.drilldowns.CxboxFB;

public class CustomFilterBuilder<D extends DataResponseDTO> extends
		CxboxFB<D, CustomFilterBuilder<D>> {

	@Override
	public CustomFilterBuilder<D> input(@NonNull DtoField<? super D, String> field, @Nullable String value) {
		final DrillDownFieldFilter<D, String> drillDownFieldFilter = formDrillDownFieldFilterSingleValue(
				SearchOperation.CONTAINS,
				field,
				value
		);
		if (drillDownFieldFilter == null) {
			return this;
		}
		add(drillDownFieldFilter);
		return this;
	}

	public CustomFilterBuilder<D> newTypeField(@NonNull DtoField<? super D, String> field, @Nullable String value) {
		final DrillDownFieldFilter<D, String> drillDownFieldFilter = formDrillDownFieldFilterSingleValue(
				SearchOperation.CONTAINS,
				field,
				value
		);
		if (drillDownFieldFilter == null) {
			return this;
		}
		add(drillDownFieldFilter);
		return this;
	}

}

package org.demo.conf.cxbox.extension.drilldown;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.UnaryOperator;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.AccessLevel;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.cxbox.api.data.BcIdentifier;
import org.cxbox.api.data.dto.DataResponseDTO;
import org.cxbox.constgen.DtoField;
import org.cxbox.core.controller.param.SearchOperation;
import org.cxbox.core.dto.multivalue.MultivalueField;
import org.cxbox.core.dto.multivalue.MultivalueFieldSingleValue;
import org.cxbox.core.util.JsonUtils;
import org.cxbox.core.util.filter.provider.impl.DateValueProvider;
import org.cxbox.core.util.filter.provider.impl.DictionaryValueProvider;
import org.cxbox.core.util.filter.provider.impl.EnumValueProvider;
import org.cxbox.core.util.filter.provider.impl.MultiFieldValueProvider;
import org.cxbox.core.util.filter.provider.impl.StringValueProvider;
import org.cxbox.dictionary.Dictionary;
import org.springframework.stereotype.Service;

/**
 * @deprecated ATTENTION! This is just a draft. It Will be seriously changed in "4.0.0-M17" release - do not use it in your production code for now. Marked deprecated for this reason
 */
@Deprecated(since = "4.0.0-M16-SNAPSHOT")
@Service
@RequiredArgsConstructor
public final class DrillDownExt {

	/**
	 * Generates  {@code ?filters=..} url query parameter
	 * used by frontend to filter any bc on view that will be opened after drill down
	 * <br>Example with single field:
	 * {@code ?filters={\"client\":\"status.equalsOneOf=[\"New\"]\"}} (url decoded for readability!)
	 * <br>Example with multiple fields:
	 * {@code ?filters={\"client\":\"status.equalsOneOf=[\"In+progress\"]&fieldOfActivity.equalsOneOf=[\"IT\"]\"}"  } (url decoded for readability!)
	 *
	 * @param bc any bc on view that will be opened after drill down
	 * @param dto DTO class of {@code bc}
	 * @param fb builder to add field filters. it will check that fields belong to {@code dto}
	 * @return string to concatenate to drillDown url. ? included
	 */
	@NonNull
	public <D extends DataResponseDTO> String filterBcByFields(
			@NonNull BcIdentifier bc,
			@NonNull Class<D> dto,
			@NonNull UnaryOperator<Fb<D>> fb) {
		var builder = new Fb<>(bc, dto);
		fb.apply(builder);
		return builder.build().map(s -> "?" + s).orElse("");
	}

	/**
	 * DrillDown filter by fields builder.
	 * <br>We keep class name very short
	 * to make inline highlights in IntelliJ IDEA non-disturbing in the most common usage case
	 */
	@RequiredArgsConstructor(access = AccessLevel.MODULE)
	public static final class Fb<D extends DataResponseDTO> {

		private static final String AMPERSAND_URL_ENCODED = URLEncoder.encode("&", StandardCharsets.UTF_8);

		@NonNull
		private final BcIdentifier bc;

		@NonNull
		private final Class<D> clz;

		@NonNull
		private List<DrillDownFieldFilter<D, ?>> fieldFilters = new ArrayList<>();

		private Optional<String> build() {
			if (this.fieldFilters.isEmpty()) {
				return Optional.empty();
			}
			var cleanedList = fieldFilters.stream()
					.filter(Objects::nonNull)
					.filter(DrillDownFieldFilter::isNotEmpty)
					.toList();
			if (cleanedList.isEmpty()) {
				return Optional.empty();
			}

			return Optional.of("filters={\""
					+ bc.getName() +
					"\":\"" +
					cleanedList.stream().map(DrillDownFieldFilter::urlEncodedFieldFilter)
							.collect(Collectors.joining(AMPERSAND_URL_ENCODED))
					+ "\"}");
		}

		/**
		 * Attention! Will be moved to {@link StringValueProvider}
		 * <br>Use only for fields having {@code "type" : "input"} in .widget.json
		 *
		 * @param field DTO field
		 * @param value DTO value
		 * @return string to concat in drillDown filter
		 */
		public Fb<D> input(@NonNull DtoField<? super D, String> field, @Nullable String value) {
			if (value == null) {
				return this;
			}
			fieldFilters.add(new DrillDownFieldFilter<D, String>(URLEncoder.encode(
					field.getName() +
							"." + SearchOperation.CONTAINS.getOperationName() +
							"=" + value, StandardCharsets.UTF_8
			)));
			return this;
		}

		/**
		 * Attention! Will be moved to {@link DictionaryValueProvider}
		 * <br> use only for fields having {@code "type" : "dictionary"} in .widget.json and {@code ? extends Dictionary} in DTO
		 *
		 * @param field DTO field
		 * @param value DTO value
		 * @return string to concat in drillDown filter
		 */
		public <T extends Dictionary> Fb<D> dictionary(@NonNull DtoField<? super D, T> field, @Nullable T value) {
			if (value == null) {
				return this;
			}
			this.fieldFilters.add(new DrillDownFieldFilter<>(URLEncoder.encode(
					field.getName() +
							"." + SearchOperation.EQUALS_ONE_OF.getOperationName() +
							"=" + "[\\\"" + Optional.of(value)
							.map(JsonUtils::writeValue)
							.map(s -> s.substring(1, s.length() - 1))
							.orElseThrow()
							+ "\\\"]",
					StandardCharsets.UTF_8
			)));
			return this;
		}

		/**
		 * Attention! Will be moved to {@link EnumValueProvider}
		 * <br>Use only for fields having {@code "type" : "dictionary"} in .widget.json and {@code ? extends Dictionary} in DTO
		 *
		 * @param field DTO field
		 * @param value DTO value
		 * @return string to concat in drillDown filter
		 */
		public <T extends Enum<?>> Fb<D> dictionaryEnum(@NonNull DtoField<? super D, T> field, @Nullable T value) {
			if (value == null) {
				return this;
			}
			this.fieldFilters.add(new DrillDownFieldFilter<>(URLEncoder.encode(
					field.getName() +
							"." + SearchOperation.EQUALS_ONE_OF.getOperationName() +
							"=" + "[\\\"" + Optional.of(value)
							.map(JsonUtils::writeValue)
							.map(s -> s.substring(1, s.length() - 1))
							.orElseThrow() + "\\\"]",
					StandardCharsets.UTF_8
			)));
			return this;
		}

		/**
		 * will be moved to {@link DateValueProvider}
		 * <br> Use only for fields having {@code "type" : "date"} in .widget.json and {@code ? extends Dictionary} in DTO
		 *
		 * @param field DTO field
		 * @param value included. converted to LocalDateTime by adding 00:00:00
		 * @return string to concat in drillDown filter
		 */
		private DrillDownFieldFilter<D, LocalDateTime> dateFromFilter(@NonNull DtoField<? super D, LocalDateTime> field,
				@Nullable LocalDate value) {
			if (value == null) {
				return new DrillDownFieldFilter<>(null);
			}
			return new DrillDownFieldFilter<>(URLEncoder.encode(
					field.getName() +
							"." + SearchOperation.GREATER_OR_EQUAL_THAN.getOperationName() +
							"=" + Optional.of(value.atStartOfDay())
							.map(JsonUtils::writeValue)
							.map(s -> s.substring(1, s.length() - 1))
							.orElseThrow(),
					StandardCharsets.UTF_8
			));
		}

		/**
		 * Attention! Will be moved to {@link DateValueProvider}
		 * <br> Use only for fields having {@code "type" : "date"} in .widget.json and {@code ? extends Dictionary} in DTO
		 *
		 * @param field DTO field
		 * @param value included. converted to LocalDateTime by adding 23:59:59
		 * @return string to concat in drillDown filter
		 */
		private DrillDownFieldFilter<D, LocalDateTime> dateToFilter(@NonNull DtoField<? super D, LocalDateTime> field,
				@Nullable LocalDate value) {
			if (value == null) {
				return new DrillDownFieldFilter<>(null);
			}
			return new DrillDownFieldFilter<>(URLEncoder.encode(
					field.getName() +
							"." + SearchOperation.LESS_OR_EQUAL_THAN.getOperationName() +
							"=" + Optional.of(value.atTime(23, 59, 59))
							.map(JsonUtils::writeValue)
							.map(s -> s.substring(1, s.length() - 1))
							.orElseThrow(),
					StandardCharsets.UTF_8
			));
		}

		/**
		 * Attention! Will be moved to {@link DateValueProvider}
		 * <br> Use only for fields having {@code "type" : "date"} in .widget.json and {@code ? extends Dictionary} in DTO
		 *
		 * @param field DTO field
		 * @param value date. converted to filter from (including) LocalDateTime by adding 00:00:00 to (including) LocalDateTime 23:59:59
		 * @return string to concat in drillDown filter
		 */
		public Fb<D> date(@NonNull DtoField<? super D, LocalDateTime> field, @Nullable LocalDate value) {
			if (value == null) {
				return this;
			}
			this.fieldFilters.add(new DrillDownFieldFilter<>(dateFromFilter(field, value)
					+ AMPERSAND_URL_ENCODED
					+ dateToFilter(field, value))
			);
			return this;
		}

		/**
		 * Attention! Will be moved to {@link DateValueProvider}
		 * <br> Use only for fields having {@code "type" : "date"} in .widget.json and {@code ? extends Dictionary} in DTO
		 *
		 * @param field DTO field
		 * @param from date. converted to filter from (including) LocalDateTime by adding 00:00:00
		 * @param to date. converted to filter from (including) LocalDateTime by adding 23:59:59
		 * @return string to concat in drillDown filter
		 */
		@NonNull
		public DrillDownExt.Fb<D> dateFromTo(@NonNull DtoField<? super D, LocalDateTime> field, @Nullable LocalDate from,
				@Nullable LocalDate to) {
			if (from != null && to != null) {
				this.fieldFilters.add(new DrillDownFieldFilter<>(
						dateFromFilter(field, from).urlEncodedFieldFilter() +
								AMPERSAND_URL_ENCODED +
								dateToFilter(field, to).urlEncodedFieldFilter()));
				return this;
			}

			if (from != null) {
				this.fieldFilters.add(dateFromFilter(field, from));
				return this;
			}
			if (to != null) {
				this.fieldFilters.add(dateToFilter(field, to));
				return this;
			}
			return this;
		}


		/**
		 * Attention! Will be moved to {@link MultiFieldValueProvider}
		 * <br> Use only for fields having {@code "type" : "multivalue"} in .widget.json and {@code MultivalueField} in DTO
		 *
		 * @param field DTO field
		 * @param value DTO value
		 * @return string to concat in drillDown filter
		 */
		public Fb<D> multiValue(@NonNull DtoField<? super D, MultivalueField> field, @Nullable MultivalueField value) {
			if (value == null) {
				return this;
			}
			this.fieldFilters.add(new DrillDownFieldFilter<>(URLEncoder.encode(
					field.getName() +
							"." + SearchOperation.EQUALS_ONE_OF.getOperationName() +
							"=" + "[\\\"" + Optional.of(value)
							.map(mv -> mv.getValues().stream()
									.map(MultivalueFieldSingleValue::getValue)
									.collect(Collectors.joining("\\\",\\\"")))
							.orElseThrow() + "\\\"]",
					StandardCharsets.UTF_8
			)));
			return this;
		}

		public record DrillDownFieldFilter<D, T>(String urlEncodedFieldFilter) {

			public boolean isNotEmpty() {
				return !Strings.isBlank(urlEncodedFieldFilter);
			}

		}

	}

}

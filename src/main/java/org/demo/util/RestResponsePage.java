package org.demo.util;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public class RestResponsePage<T> extends PageImpl<T> implements Serializable {

	@JsonCreator(mode = JsonCreator.Mode.PROPERTIES)
	public RestResponsePage(@JsonProperty("content") List<T> content,
			@JsonProperty("number") int number,
			@JsonProperty("size") int size,
			@JsonProperty("totalElements") Long totalElements,
			@JsonProperty("pageable") JsonNode pageable,
			@JsonProperty("last") boolean last,
			@JsonProperty("totalPages") int totalPages,
			@JsonProperty("sort") JsonNode sort,
			@JsonProperty("first") boolean first,
			@JsonProperty("empty") boolean empty) {
		super(content, PageRequest.of(number, size), totalElements);
	}

	public RestResponsePage(final List<T> content, final Pageable pageable, final long total) {
		super(content, pageable, total);
	}

	public RestResponsePage(final List<T> content) {
		super(content);
	}

	public RestResponsePage() {
		super(new ArrayList<>());
	}

	@Override
	public <U> Page<U> map(final Function<? super T, ? extends U> converter) {
		return new RestResponsePage<>(this.getConvertedContent(converter), this.getPageable(), this.getTotalElements());
	}

}
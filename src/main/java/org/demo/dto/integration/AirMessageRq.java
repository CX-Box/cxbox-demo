package org.demo.dto.integration;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder(toBuilder = true)
public class AirMessageRq {

	public String content;

	public String file;

}

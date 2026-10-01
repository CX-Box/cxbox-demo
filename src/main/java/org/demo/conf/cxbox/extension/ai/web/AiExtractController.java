package org.demo.conf.cxbox.extension.ai.web;

import static org.cxbox.core.config.properties.APIProperties.CXBOX_API_PATH_SPEL;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.demo.conf.cxbox.extension.ai.AiExtractService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(CXBOX_API_PATH_SPEL + "/ai")
public class AiExtractController {

	private final AiExtractService aiExtractService;

	@PostMapping("/extract")
	public AiExtractResponse extract(@RequestBody AiExtractRequest request) {
		log.debug("ai: extract {}", request);
		AiExtractResponse response = aiExtractService.extract(request);
		log.debug("ai: extracted {}", response);

		return response;
	}

}

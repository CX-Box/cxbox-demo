package org.demo.conf.cxbox.customization.file;

import static org.cxbox.core.config.properties.APIProperties.CXBOX_API_PATH_SPEL;

import org.cxbox.core.file.controller.AbstractCxboxFileController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(CXBOX_API_PATH_SPEL + "/file")
public class FileController extends AbstractCxboxFileController {

}

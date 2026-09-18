package org.demo.conf.cxbox.extension.ai.mapping;

import java.util.List;
import lombok.NonNull;
import org.demo.conf.cxbox.extension.ai.recognize.RecognizedDocument;

/**
 * Second of two models: lays the recognized text out on the fields of the form.
 */
public interface FieldMapper {

	boolean available();

	@NonNull
	List<MappedField> map(@NonNull RecognizedDocument document, @NonNull List<TargetField> fields);

}

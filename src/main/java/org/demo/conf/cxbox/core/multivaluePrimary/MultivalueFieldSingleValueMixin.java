package org.demo.conf.cxbox.core.multivaluePrimary;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

/**
 * fix to enable options.usePrimary feature for multivalue fields
 */
@JsonDeserialize(using = CustomMultivalueFieldSingleValueDeserializer.class)
public abstract class MultivalueFieldSingleValueMixin {

}

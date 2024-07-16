package org.demo.testforilia.bc1parent;

import lombok.Getter;
import org.cxbox.api.data.BcIdentifier;
import org.cxbox.core.crudma.bc.EnumBcIdentifier;
import org.cxbox.core.crudma.bc.impl.AbstractEnumBcSupplier;
import org.cxbox.core.crudma.bc.impl.BcDescription;
import org.demo.testforilia.bc1.MyExample1222Service;
import org.demo.testforilia.bc3.MyExample1224Service;
import org.demo.testforilia.bc4.MyExample1225Service;
import org.springframework.stereotype.Component;

@Getter
public enum CxboxMyExample1223Controller implements EnumBcIdentifier {

	// @formatter:on

	myexample1223(MyExample1223Service.class),
	myexample1225(myexample1223, MyExample1225Service.class),
	myexample1222(myexample1223,MyExample1222Service.class),
	myexample1224(myexample1222, MyExample1224Service.class)

	;

	// @formatter:on

	public static final EnumBcIdentifier.Holder<CxboxMyExample1223Controller> Holder = new Holder<>(
			CxboxMyExample1223Controller.class);

	private final BcDescription bcDescription;

	CxboxMyExample1223Controller(String parentName, Class<?> serviceClass, boolean refresh) {
		this.bcDescription = buildDescription(parentName, serviceClass, refresh);
	}

	CxboxMyExample1223Controller(String parentName, Class<?> serviceClass) {
		this(parentName, serviceClass, false);
	}

	CxboxMyExample1223Controller(BcIdentifier parent, Class<?> serviceClass, boolean refresh) {
		this(parent == null ? null : parent.getName(), serviceClass, refresh);
	}

	CxboxMyExample1223Controller(BcIdentifier parent, Class<?> serviceClass) {
		this(parent, serviceClass, false);
	}

	CxboxMyExample1223Controller(Class<?> serviceClass, boolean refresh) {
		this((String) null, serviceClass, refresh);
	}

	CxboxMyExample1223Controller(Class<?> serviceClass) {
		this((String) null, serviceClass, false);
	}

	@Component
	public static class BcSupplier extends AbstractEnumBcSupplier<CxboxMyExample1223Controller> {

		public BcSupplier() {
			super(CxboxMyExample1223Controller.Holder);
		}

	}

}
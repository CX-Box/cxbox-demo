package org.demo.entity.dictionary;

import java.io.Serial;
import java.util.Objects;
import org.cxbox.dictionary.Dictionary;

public final class EmployeeRequestRegulatorRole implements Dictionary {

	public static final EmployeeRequestRegulatorRole COORDINATOR = new EmployeeRequestRegulatorRole("COORDINATOR");

	public static final EmployeeRequestRegulatorRole COORDINATOR_DVS = new EmployeeRequestRegulatorRole("COORDINATOR_DVS");

	public static final EmployeeRequestRegulatorRole OBSERVER = new EmployeeRequestRegulatorRole("OBSERVER");

	public static final EmployeeRequestRegulatorRole ACCOUNTANT = new EmployeeRequestRegulatorRole("ACCOUNTANT");

	@Serial
	private static final long serialVersionUID = 0L;

	private final String keys;

	public EmployeeRequestRegulatorRole(String keys) {
		this.keys = keys;
	}

	@Override
	public String key() {
		return keys;
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == this) {
			return true;
		}
		if (obj == null || obj.getClass() != this.getClass()) {
			return false;
		}
		var that = (EmployeeRequestRegulatorRole) obj;
		return Objects.equals(this.keys, that.keys);
	}

	@Override
	public int hashCode() {
		return Objects.hash(keys);
	}

	@Override
	public String toString() {
		return "EmployeeRequestRegulatorRole[" +
				"key=" + keys + ']';
	}

}

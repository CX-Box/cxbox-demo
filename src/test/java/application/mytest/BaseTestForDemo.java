package application.mytest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import application.config.BaseTestForSamples;
import core.MainPages;
import core.widget.form.FormWidget;
import java.util.HashSet;
import org.demo.entity.enums.FieldOfActivity;
import org.junit.jupiter.api.Test;

public class BaseTestForDemo extends BaseTestForSamples {

	@Test
	void firstTest() {
		//Ищет экран из списка
		MainPages.click("Dashboard");
		//Ищем виджет
		FormWidget form = $box.findFormWidgetByName("dashboardFilter");

		var customField = form.multipleSelect("Field of Activity");

		HashSet<String> testSet = new HashSet<>();
		testSet.add(FieldOfActivity.IT.getValue());
		customField.setValue(testSet);

		form.clickButton("Apply Filters");

		assertThat(customField.getValue()).isEqualTo(testSet);
	}

}

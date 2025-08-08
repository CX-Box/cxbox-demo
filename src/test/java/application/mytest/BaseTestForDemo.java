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
	void firstTest(){
		//Ищет экран из списка
		MainPages.click("Dashboard");
		//Ищем виджет
		FormWidget form = $box.findFormWidgetByName("dashboardFilter");
	//Возвращает поле формата number
	var customField = form.multipleSelect("Field of Activity");
	//Устанавливает значение на 1000
	HashSet<String> testSet = new HashSet<>();
		testSet.add(FieldOfActivity.IT.getValue());
		customField.setValue(testSet);
	//На виджете нажимает на Save
		form.clickButton("Apply Filters");
	//Проверяет значение, установленное в поле
	assertThat(customField.getValue()).isEqualTo(FieldOfActivity.IT.getValue());
}

}

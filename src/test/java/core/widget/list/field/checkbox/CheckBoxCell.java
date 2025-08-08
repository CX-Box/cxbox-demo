package core.widget.list.field.checkbox;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class CheckBoxCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "checkbox".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = String.valueOf(element.$("input").isSelected());
        cell.setCellValue(text);
    }
}

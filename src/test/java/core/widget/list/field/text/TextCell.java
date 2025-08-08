package core.widget.list.field.text;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class TextCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "text".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        cell.setCellValue(element.getText());
    }
}

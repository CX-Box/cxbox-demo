package core.widget.list.field.input;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class InputCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "input".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        cell.setCellValue(element.getText());
    }
}

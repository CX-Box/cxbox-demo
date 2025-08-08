package core.widget.list.field.radio;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class RadioCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "radio".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", " ");
        cell.setCellValue(text);
    }
}

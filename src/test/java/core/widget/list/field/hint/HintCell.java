package core.widget.list.field.hint;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class HintCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "hint".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", " ");
        cell.setCellValue(text);
    }
}

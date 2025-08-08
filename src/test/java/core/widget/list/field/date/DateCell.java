package core.widget.list.field.date;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class DateCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "date".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText();
        cell.setCellValue(text);
    }
}

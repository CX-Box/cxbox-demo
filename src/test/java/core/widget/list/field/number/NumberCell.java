package core.widget.list.field.number;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class NumberCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "number".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", "")
                .replace(" ", "").replace(",", ".");
        double number = Double.parseDouble(text);
        if (number % 1 == 0) {
            cell.setCellValue((int) number);
        } else {
            cell.setCellValue(number);
        }
    }
}

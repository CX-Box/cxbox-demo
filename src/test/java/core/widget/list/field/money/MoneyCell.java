package core.widget.list.field.money;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class MoneyCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "money".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", "")
                .replace(" ", "")
                .replace(",", ".");
        double number = Double.parseDouble(text);
        cell.setCellValue(number);
    }
}

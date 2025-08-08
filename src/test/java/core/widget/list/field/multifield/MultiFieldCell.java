package core.widget.list.field.multifield;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class MultiFieldCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "multifield".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.$$("div[class*=\"MultiField__listValue\"][data-test-field-type]")
                .texts()
                .toString()
                .replace(" ", " ")
                .replace("[", "")
                .replace("]", "")
                .replace(",", "\n");
        cell.setCellValue(text);
    }
}

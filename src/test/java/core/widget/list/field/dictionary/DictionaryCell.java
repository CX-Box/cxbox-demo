package core.widget.list.field.dictionary;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class DictionaryCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "dictionary".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", " ");
        cell.setCellValue(text);
    }
}

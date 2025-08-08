package core.widget.TestingTools;

import com.codeborne.selenide.SelenideElement;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;

public class CellManager {
    private final List<CellProcessor> processors;

    public CellManager(List<CellProcessor> processors) {
        this.processors = processors;
    }

    public void processElement(SelenideElement element, Cell cell) {
        for (CellProcessor processor : processors) {
            if (processor.getTypeField(element)) {
                processor.processSetCellValue(element, cell);
                return;
            }
        }
        throw new IllegalArgumentException("No processor available for element text: "
                + element.getText()
                + ", element type: "
                + element.$("div").getAttribute("data-test-field-type"));
    }


}

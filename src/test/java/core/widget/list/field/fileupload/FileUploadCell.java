package core.widget.list.field.fileupload;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;

public class FileUploadCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "fileUpload".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", " ");
        cell.setCellValue(text);
    }
}

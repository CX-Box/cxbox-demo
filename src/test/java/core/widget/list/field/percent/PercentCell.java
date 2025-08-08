package core.widget.list.field.percent;

import com.codeborne.selenide.SelenideElement;
import core.widget.TestingTools.CellProcessor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Workbook;

public class PercentCell extends CellProcessor {
    @Override
    protected boolean getTypeField(SelenideElement element) {
        return "percent".equals(element.getAttribute("data-test-field-type"));
    }

    @Override
    protected void processValue(SelenideElement element, Cell cell) {
        String text = element.getText()
                .replace(" ", "")
                .replace(" ", "")
                .replace(",", ".")
                .replace("%", "");
        double number = Double.parseDouble(text);
        number = number / 100;
        if (number % 1 == 0) {
            cell.setCellValue((int) number);
        } else {
            cell.setCellValue(number);
        }
        Workbook workbook = cell.getSheet().getWorkbook();
        CellStyle cellStyle = workbook.createCellStyle();
        cellStyle.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));
        cell.setCellStyle(cellStyle);
    }
}

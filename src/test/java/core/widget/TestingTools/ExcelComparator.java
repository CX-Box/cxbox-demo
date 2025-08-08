package core.widget.TestingTools;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellReference;

@Slf4j
public class ExcelComparator {

    private static final String CELL_DATA_DOES_NOT_MATCH = "Cell Data does not Match ::";

    private static class Locator {
        Workbook workbook;
        Sheet sheet;
        Row row;
        Cell cell;
    }

    List<String> listOfDifferences = new ArrayList<String>();

    public static void main(String[] args) throws Exception {
        if (args.length != 2 || !(new File(args[0]).exists()) || !(new File(args[1]).exists())) {
            log.error("java -cp <classpath> " + ExcelComparator.class.getCanonicalName() + " <workbook1.xls/x> <workbook2.xls/x");
            System.exit(-1);
        }
        Workbook wb1 = WorkbookFactory.create(new File(args[0]));
        Workbook wb2 = WorkbookFactory.create(new File(args[1]));

        for (String d : ExcelComparator.compare(wb1, wb2)) {
            log.info(d);
        }

        wb2.close();
        wb1.close();
    }

    public static List<String> compare(Workbook wb1, Workbook wb2) {
        Locator loc1 = new Locator();
        Locator loc2 = new Locator();
        loc1.workbook = wb1;
        loc2.workbook = wb2;

        ExcelComparator excelComparator = new ExcelComparator();
        excelComparator.compareNumberOfSheets(loc1, loc2);
        excelComparator.compareSheetNames(loc1, loc2);
        excelComparator.compareSheetData(loc1, loc2);

        return excelComparator.listOfDifferences;
    }


    private void compareDataInAllSheets(Locator loc1, Locator loc2) {
        for (int i = 0; i < loc1.workbook.getNumberOfSheets(); i++) {
            if (loc2.workbook.getNumberOfSheets() <= i) return;

            loc1.sheet = loc1.workbook.getSheetAt(i);
            loc2.sheet = loc2.workbook.getSheetAt(i);

            compareDataInSheet(loc1, loc2);
        }
    }

    private void compareDataInSheet(Locator loc1, Locator loc2) {
        for (int j = 0; j < loc1.sheet.getPhysicalNumberOfRows(); j++) {
            if (loc2.sheet.getPhysicalNumberOfRows() <= j) return;

            loc1.row = loc1.sheet.getRow(j);
            loc2.row = loc2.sheet.getRow(j);

            if ((loc1.row == null) || (loc2.row == null)) {
                continue;
            }

            compareDataInRow(loc1, loc2);
        }
    }

    private void compareDataInRow(Locator loc1, Locator loc2) {
        for (int k = 0; k < loc1.row.getLastCellNum(); k++) {
            if (loc2.row.getPhysicalNumberOfCells() <= k) return;

            loc1.cell = loc1.row.getCell(k);
            loc2.cell = loc2.row.getCell(k);

            if ((loc1.cell == null) || (loc2.cell == null)) {
                continue;
            }

            compareDataInCell(loc1, loc2);
        }
    }

    private void compareDataInCell(Locator loc1, Locator loc2) {
        if (isCellTypeMatches(loc1, loc2)) {
            final CellType loc1cellType = loc1.cell.getCellType();
            switch (loc1cellType) {
                case BLANK:
                case STRING:
                case ERROR:
                    isCellContentMatches(loc1, loc2);
                    break;
                case BOOLEAN:
                    isCellContentMatchesForBoolean(loc1, loc2);
                    break;
                case FORMULA:
                    isCellContentMatchesForFormula(loc1, loc2);
                    break;
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(loc1.cell)) {
                        isCellContentMatchesForDate(loc1, loc2);
                    } else {
                        isCellContentMatchesForNumeric(loc1, loc2);
                    }
                    break;
                default:
                    throw new IllegalStateException("Unexpected cell type: " + loc1cellType);
            }
        }

        isCellFillPatternMatches(loc1, loc2);
    }

    /**
     * Compare number of columns in sheets.
     */
    private void compareNumberOfColumnsInSheets(Locator loc1, Locator loc2) {
        for (int i = 0; i < loc1.workbook.getNumberOfSheets(); i++) {
            if (loc2.workbook.getNumberOfSheets() <= i) return;

            loc1.sheet = loc1.workbook.getSheetAt(i);
            loc2.sheet = loc2.workbook.getSheetAt(i);

            Iterator<Row> ri1 = loc1.sheet.rowIterator();
            Iterator<Row> ri2 = loc2.sheet.rowIterator();

            int num1 = (ri1.hasNext()) ? ri1.next().getPhysicalNumberOfCells() : 0;
            int num2 = (ri2.hasNext()) ? ri2.next().getPhysicalNumberOfCells() : 0;

            if (num1 != num2) {
                String str = String.format(Locale.ROOT, "%s\nworkbook1 -> %s [%d] != workbook2 -> %s [%d]",
                        "Number Of Columns does not Match ::",
                        loc1.sheet.getSheetName(), num1,
                        loc2.sheet.getSheetName(), num2
                );
                listOfDifferences.add(str);
            }
        }
    }

    /**
     * Compare number of rows in sheets.
     */
    private void compareNumberOfRowsInSheets(Locator loc1, Locator loc2) {
        for (int i = 0; i < loc1.workbook.getNumberOfSheets(); i++) {
            if (loc2.workbook.getNumberOfSheets() <= i) return;

            loc1.sheet = loc1.workbook.getSheetAt(i);
            loc2.sheet = loc2.workbook.getSheetAt(i);

            int num1 = loc1.sheet.getPhysicalNumberOfRows();
            int num2 = loc2.sheet.getPhysicalNumberOfRows();

            if (num1 != num2) {
                String str = String.format(Locale.ROOT, "%s\nworkbook1 -> %s [%d] != workbook2 -> %s [%d]",
                        "Number Of Rows does not Match ::",
                        loc1.sheet.getSheetName(), num1,
                        loc2.sheet.getSheetName(), num2
                );
                listOfDifferences.add(str);
            }
        }

    }

    /**
     * Compare number of sheets.
     */
    private void compareNumberOfSheets(Locator loc1, Locator loc2) {
        int num1 = loc1.workbook.getNumberOfSheets();
        int num2 = loc2.workbook.getNumberOfSheets();
        if (num1 != num2) {
            String str = String.format(Locale.ROOT, "%s\nworkbook1 [%d] != workbook2 [%d]",
                    "Number of Sheets do not match ::",
                    num1, num2
            );

            listOfDifferences.add(str);

        }
    }

    private void compareSheetData(Locator loc1, Locator loc2) {
        compareNumberOfRowsInSheets(loc1, loc2);
        compareNumberOfColumnsInSheets(loc1, loc2);
        compareDataInAllSheets(loc1, loc2);

    }

    /**
     * Compare sheet names.
     */
    private void compareSheetNames(Locator loc1, Locator loc2) {
        for (int i = 0; i < loc1.workbook.getNumberOfSheets(); i++) {
            String name1 = loc1.workbook.getSheetName(i);
            String name2 = (loc2.workbook.getNumberOfSheets() > i) ? loc2.workbook.getSheetName(i) : "";

        }
    }

    /**
     * Formats the message.
     */
    private void addMessage(Locator loc1, Locator loc2, String messageStart, String value1, String value2) {
        String str =
                String.format(Locale.ROOT, "%s\nworkbook1 -> %s -> %s [%s] != workbook2 -> %s -> %s [%s]",
                        messageStart,
                        loc1.sheet.getSheetName(), new CellReference(loc1.cell).formatAsString(), value1,
                        loc2.sheet.getSheetName(), new CellReference(loc2.cell).formatAsString(), value2
                );
        listOfDifferences.add(str);
    }


    /**
     * Checks if cell content matches.
     */
    private void isCellContentMatches(Locator loc1, Locator loc2) {
        String str1 = loc1.cell.getRichStringCellValue().getString();
        String str2 = loc2.cell.getRichStringCellValue().getString();
        if (!str1.equals(str2)) {
            addMessage(loc1, loc2, CELL_DATA_DOES_NOT_MATCH, str1, str2);
        }
    }

    /**
     * Checks if cell content matches for boolean.
     */
    private void isCellContentMatchesForBoolean(Locator loc1, Locator loc2) {
        boolean b1 = loc1.cell.getBooleanCellValue();
        boolean b2 = loc2.cell.getBooleanCellValue();
        if (b1 != b2) {
            addMessage(loc1, loc2, CELL_DATA_DOES_NOT_MATCH, Boolean.toString(b1), Boolean.toString(b2));
        }
    }

    /**
     * Checks if cell content matches for date.
     */
    private void isCellContentMatchesForDate(Locator loc1, Locator loc2) {
        Date date1 = loc1.cell.getDateCellValue();
        Date date2 = loc2.cell.getDateCellValue();
        if (!date1.equals(date2)) {
            addMessage(loc1, loc2, CELL_DATA_DOES_NOT_MATCH, date1.toGMTString(), date2.toGMTString());
        }
    }


    /**
     * Checks if cell content matches for formula.
     */
    private void isCellContentMatchesForFormula(Locator loc1, Locator loc2) {
        String form1 = loc1.cell.getCellFormula();
        String form2 = loc2.cell.getCellFormula();
        if (!form1.equals(form2)) {
            addMessage(loc1, loc2, CELL_DATA_DOES_NOT_MATCH, form1, form2);
        }
    }

    /**
     * Checks if cell content matches for numeric.
     */
    private void isCellContentMatchesForNumeric(Locator loc1, Locator loc2) {
        double num1 = loc1.cell.getNumericCellValue();
        double num2 = loc2.cell.getNumericCellValue();
        if (num1 != num2) {
            addMessage(loc1, loc2, CELL_DATA_DOES_NOT_MATCH, Double.toString(num1), Double.toString(num2));
        }
    }

    /**
     * Checks if cell fill pattern matches.
     */
    private void isCellFillPatternMatches(Locator loc1, Locator loc2) {
        short fill1 = loc1.cell.getCellStyle().getFillPattern().getCode();
        short fill2 = loc2.cell.getCellStyle().getFillPattern().getCode();
        if (fill1 != fill2) {
            addMessage(loc1, loc2,
                    "Cell Fill pattern does not Match ::",
                    Short.toString(fill1),
                    Short.toString(fill2)
            );
        }
    }


    /**
     * Checks if cell type matches.
     */
    private boolean isCellTypeMatches(Locator loc1, Locator loc2) {
        CellType type1 = loc1.cell.getCellType();
        CellType type2 = loc2.cell.getCellType();
        if (type1 == type2) return true;
        addMessage(loc1, loc2,
                "Cell Data-Type does not Match in :: ",
                type1.name(), type2.name()
        );
        return false;
    }

}
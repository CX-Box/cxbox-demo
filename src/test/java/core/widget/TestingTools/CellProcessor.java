package core.widget.TestingTools;

import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Allure;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;

@Slf4j
public abstract class CellProcessor {
    protected abstract boolean getTypeField(SelenideElement element);

    protected abstract void processValue(SelenideElement element, Cell cell);

    public final void processSetCellValue(SelenideElement element, Cell cell) {
        if (getTypeField(element)) {
            log.info("Field type: {}", element.getAttribute("data-test-field-type"));
            processValue(element, cell);
        } else {
            throw new IllegalArgumentException("Unsupported element type: " + element);
        }

    }

    public static void logTime(Allure.StepContext step) {
        step.parameter("startTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd-MM-yyyy")));
    }
}

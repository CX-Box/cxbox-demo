package core.widget.addfiles;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.io.File;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import org.openqa.selenium.By;

@Getter
public class DragAndDropFileZone {

    protected final SelenideElement dragZone;

    protected FilesPopup popup;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    public DragAndDropFileZone(SelenideElement dragZone) {
        this.dragZone = dragZone;
        this.popup = new FilesPopup();
    }

    /**
     * Sending a file to the download area
     *
     * @param file File name or path to it
     */
    public void setValue(File file) {
        Allure.step("Sending the " + file + " file to the download area", step -> {
            logTime(step);
            step.parameter("file", file);

            dragZone.$("input")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .uploadFile(file);
        });
    }

    /**
     * Getting a used icon in the download area
     *
     * @return String attribute values
     */

    public String getIconZone() {
        return Allure.step("Getting a used icon in the download area", step -> {
            logTime(step);
            return Objects.requireNonNull(dragZone
                    .$("p[class*=\"FileUpload__icon\"]")
                    .find(By.tagName("i"))
                    .getAttribute("aria-label"));
        });
    }

    /**
     * Getting the button text in the download area
     *
     * @return String
     */


    public String getImitationButtonZone() {
        return Allure.step("Getting the button text in the download area", step -> {
            logTime(step);
            return dragZone
                    .$("p[class*=\"FileUpload__imitationButton\"]")
                    .getText();
        });
    }

    /**
     * Getting the main text of the download area
     *
     * @return List String
     */

    public List<String> getTextZone() {
        return Allure.step("Getting the main text of the download area", step -> {
            logTime(step);
            return dragZone
                    .$$("p[class*=\"FileUpload__text\"]")
                    .texts();
        });
    }

    /**
     * Getting HintText from the download area
     *
     * @return List String
     */

    public List<String> getHintText() {
        return Allure.step("Getting HintText from the download area", step -> {
            logTime(step);
            return dragZone
                    .$$("p[class*=\"FileUpload__hint\"]")
                    .texts();
        });
    }
}

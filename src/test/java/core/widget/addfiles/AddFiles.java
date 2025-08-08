package core.widget.addfiles;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.io.File;
import java.time.Duration;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.openqa.selenium.By;

@Getter
@Setter
public class AddFiles {
    protected final SelenideElement widget;

    protected FilesPopup popup;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();


    public AddFiles(SelenideElement widget) {
        this.widget = widget;
        this.popup = new FilesPopup();
    }

    /**
     * Uploading a file to the field
     *
     * @param file File name or path to it
     */

    public void setValue(File file) {
        Allure.step("Uploading a file " + file + " in the field", step -> {
            logTime(step);
            step.parameter("file", file);

            widget.$("div[class=\"ant-upload ant-upload-select ant-upload-select-text\"]")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .$(By.tagName("input"))
                    .uploadFile(file);
        });
    }

    /**
     * Uploading files in the field
     *
     * @param files A list of files or a list of file paths
     */
    public void setValues(List<File> files) {
        Allure.step("Uploading files in the field. Files list: " + files, step -> {
            logTime(step);
            step.parameter("files", files);

            for (File file : files) {
                widget.$("div[class=\"ant-upload ant-upload-select ant-upload-select-text\"]")
                        .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                        .$(By.tagName("input"))
                        .uploadFile(file);
            }
        });
    }
}

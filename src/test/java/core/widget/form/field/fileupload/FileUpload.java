package core.widget.form.field.fileupload;

import static com.codeborne.selenide.FileDownloadMode.FOLDER;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.DownloadOptions;
import core.widget.addfiles.FilesPopup;
import core.widget.form.FormWidget;
import core.widget.form.field.BaseField;
import io.qameta.allure.Allure;
import java.io.File;
import java.time.Duration;
import lombok.Getter;
import lombok.SneakyThrows;

@Getter
public class FileUpload extends BaseField<File> {

    private final FilesPopup popup;

    public FileUpload(FormWidget formWidget, String title) {
        super(formWidget, title, "fileUpload");
        this.popup = new FilesPopup();
    }

    public String getValueTag() {
        return "input[type=\"file\"]";
    }

    /**
     * Uploading a file from a field, getting the path to it
     *
     * @return File
     */
    @Override

    public File getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);
            return getFieldByName().$("button").download(DownloadOptions.using(FOLDER));
        });

    }

    @Override
    public void setValue(File value) {

    }

    /**
     * Uploading a file to the field
     *
     * @param value File
     *              {@code example} Hope.jpg
     */

    @SneakyThrows
    public void setValue(String value) {
        Allure.step("Uploading a file to the {value} field", step -> {
            logTime(step);
            step.parameter("File", value);

            getFieldByName().$(getValueTag()).uploadFromClasspath(value);
            getFieldByName()
                    .$("button")
                    .shouldHave(Condition.text(value), Duration.ofSeconds(waitingForTests.Timeout));
        });
    }

    /**
     * Getting the name of the downloaded file
     *
     * @return String
     */

    public String getValueName() {
        return Allure.step("Getting the downloaded file name", step -> {
            logTime(step);

            return getFieldByName()
                    .$("button")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .download(DownloadOptions.using(FOLDER))
                    .getName();
        });
    }

    /**
     * Getting the file name in the field
     *
     * @return String NameFile
     */

    public String getNameFileInField() {
        return Allure.step("Getting the file name in the field", step -> {
            logTime(step);

            return getFieldByName()
                    .$("button")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });
    }

    /**
     * Getting the placeholder text
     *
     * @return String text
     */

    public String getPlaceholder() {
        return Allure.step("Getting the Placeholder value", step -> {
            logTime(step);

            return getFieldByName()
                    .$("span[title=\"Placeholder text\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
        });

    }

    /**
     * Checking if a field is unavailable for download
     *
     * @return Boolean true/false
     */

    public boolean getReadOnly() {
        return Allure.step("Checking the field for inactivity", step -> {
            logTime(step);
            return !getFieldByName().$(getValueTag()).is(Condition.exist);
        });
    }

    /**
     * Clearing the field. Deleting a file.
     */
    public void clear() {
        Allure.step("Clearing the field. Deleting a file.", step -> {
            logTime(step);
            getFieldByName().$("i[title=\"Delete\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            getFieldByName()
                    .$("button")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldBe(Condition.empty, Duration.ofSeconds(waitingForTests.Timeout));
        });
    }
}

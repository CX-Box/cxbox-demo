package core.widget.list.field.fileupload;

import static com.codeborne.selenide.Selenide.$;

import com.codeborne.selenide.*;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.addfiles.FilesPopup;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import core.widget.modal.FileViewerPopup;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;
import lombok.Getter;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Getter
public class FileUpload extends BaseRow<File> {

    private static final Logger log = LoggerFactory.getLogger(FileUpload.class);
    private final FilesPopup popup;

    public FileUpload(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean filter, Boolean sort) {
        super(listWidget, title, "fileUpload", id, listHelper, filter, sort);
        this.popup = new FilesPopup();
    }

    /**
     * Uploading a file to the field
     *
     * @param value String
     *              {@code example} Hope.jpg
     */
    @Override
    @Step("Uploading a file to the {value} field")
    public void setValue(File value) {
        setFocusField();
        getRowByName().$(getValueTag()).uploadFile(value);

    }

    /**
     * Uploading a file from a field, getting an absolute path
     *
     * @return String
     */
    @Override
    @Step("Getting the downloaded file")
    public File getValue() {
        setFocusField();
        return getRowByName().$("button").download(DownloadOptions.using(FileDownloadMode.FOLDER));
    }

    @Override
    public String getValueTag() {
        return "input[type=\"file\"]";
    }

    /**
     * Comparison of the source file and the downloaded file
     *
     * @param value String
     * @return Boolean true/false
     */
    @Step("Comparison of the source file and the downloaded file")
    public Boolean getFileComparison(File value) {
        Allure.addAttachment("FileName", value.getName());
        return compareFiles(value);
    }

    @SneakyThrows
    private Boolean compareFiles(File value) {
        try (FileInputStream fis1 = new FileInputStream(value);
             FileInputStream fis2 = new FileInputStream(getValue())) {

            byte[] buffer1 = new byte[1024];
            byte[] buffer2 = new byte[1024];

            int bytesRead1;
            int bytesRead2;

            Selenide.sleep(100);

            while ((bytesRead1 = fis1.read(buffer1)) != -1) {
                bytesRead2 = fis2.read(buffer2);
                if (bytesRead1 != bytesRead2 || !Arrays.equals(buffer1, buffer2)) {
                    return false;
                }
            }

            return fis2.read(buffer2) == -1;
        }
    }

    /**
     * Getting the name of the downloaded file
     *
     * @return String
     */
    @Step("Getting a file from a field in File format")
    @SneakyThrows
    public String getValueName() {
        setFocusField();
        return getRowByName()
                .$("button")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .download(DownloadOptions.using(FileDownloadMode.FOLDER))
                .getName();

    }

    private File getFile(String value) throws IOException {
        ClassLoader classLoader = getClass().getClassLoader();
        URL resource = classLoader.getResource(value);

        if (resource == null) {
            throw new IllegalArgumentException("file is not found!");
        } else {
            return new File(resource.getFile());
        }
    }

    /**
     * Getting the file name in the field
     *
     * @return String NameFile
     */
    @Step("Getting the file name in the field")
    public String getNameFileInField() {
        setFocusField();
        return getRowByName()
                .$("button")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    /**
     * Getting the placeholder text
     *
     * @return String text
     */
    @Step("Getting the Placeholder value")
    public String getPlaceholder() {
        setFocusField();
        return getRowByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("span[title=\"Placeholder text\"]")
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    /**
     * Checking if a field is unavailable for download
     *
     * @return Boolean true/false
     */
    @Step("Checking the field for \"ReadOnly\"")
    public boolean getReadOnly() {
        setFocusField();
        return !getRowByName().$(getValueTag()).is(Condition.exist);
    }

    /**
     * Clearing the field. Deleting a file.
     */
    @Step("Clearing the field")
    public void clear() {
        setFocusField();
        getRowByName()
                .$("i[title=\"Delete\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        getRowByName().shouldNotHave(Condition.tagName("button"));
    }

    /**
     * Clicking on a hyperlink in the text.
     *
     * @return UnsupportedOperationException
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("DrillDown not supported on Dictionary");
    }

    /**
     * Focus on the field/A click in the field..
     */
    @Step("Focus on the field/A click in the field.")
    public void setFocusField() { // span[class*="ReadOnlyField__readOnlyField"]
        if (getRowByName().$("button[class*=\"ant-btn\"]").is(Condition.exist, Duration.ofSeconds(waitingForTests.getTimeout()))) {
            getRowByName()
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .doubleClick();
            log.info("Double click in Row for focus on segment");
        } else {
            log.warn("Double click failed");
        }
    }

    /**
     * Validation and access to FileViewerPopup
     *
     * @return File Viewer Pop up window for viewing files
     */
    @Step("Validation and access to FileViewerPopup")
    public Optional<FileViewerPopup> findFileViewerPopup() {
        getRowByName()
                .$("span[class*=\"FileIcon__root\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
        SelenideElement widget = getListHelper().getWidget();
        SelenideElement FilePopup = $("div[role=\"document\"][class*=\"FileViewerPopup__popup\"]");
        waitingForTests.getWaitAllElements(FilePopup);
        if (FilePopup.is(Condition.visible)) {
            return Optional.of(new FileViewerPopup(FilePopup, widget));
        } else {
            return Optional.empty();
        }
    }

    /**
     * Getting a message from the error field.
     *
     * @return String text
     */
    @Step("Getting a value from a field RequiredMessage")
    public String getRequiredMessage() {
        setFocusField();

        Selenide.actions()
                .moveToElement($("body"))
                .perform();
        getRowByName()
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$("span[class=\"ant-form-item-children\"]")
                .hover();
        Selenide.sleep(100);
        return getRowByName()
                .$(getREQUIRED_MESSAGE())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
    }

    /**
     * Getting a message from the error field.
     *
     * @return boolean true/false
     */
    @Step("Getting a value from a field RequiredMessage")
    public boolean hasRequiredMessage(int index) {
        Allure.addAttachment("Index", String.valueOf(index));
        String str = getRowByName()
                .$(getREQUIRED_MESSAGE())
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .text();
        return str.equals(Constants.list.get(index - 1));
    }

    @Override
    @Step("Read and compare rows")
    public boolean compareRows(String row) {
        return getRowByName().$("button span span").text().equals(row);
    }
}

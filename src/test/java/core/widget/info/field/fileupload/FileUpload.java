package core.widget.info.field.fileupload;

import static com.codeborne.selenide.FileDownloadMode.FOLDER;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.DownloadOptions;
import core.widget.info.InfoWidget;
import core.widget.info.field.BaseString;
import io.qameta.allure.Allure;
import io.qameta.allure.Step;
import java.io.File;
import java.io.FileInputStream;
import java.net.URL;
import java.time.Duration;
import java.util.Arrays;
import lombok.SneakyThrows;

public class FileUpload extends BaseString<File> {
    public FileUpload(InfoWidget infoWidget, String title) {
        super(infoWidget, title, "fileUpload");
    }

    public String getValueTag() {
        return "input[type=\"file\"]";
    }

    /**
     * Uploading a file from a field, getting the path to it
     *
     * @return String
     */
    @Override
    public File getValue() {
        return Allure.step("Getting a value from a field", step -> {
            logTime(step);

            return getFieldByName().$("button").download(DownloadOptions.using(FOLDER));
        });
    }

    /**
     * Comparison of the source file and the downloaded file
     *
     * @param value File
     * @return Boolean true/false
     */
    public Boolean getFileComparison(File value) {
        return Allure.step("Comparison of the source file and the downloaded file", step -> {
            logTime(step);
            step.parameter("File", value);

            return compareFiles(value);
        });
    }

    /**
     * Byte comparison of uploaded and downloaded file
     *
     * @param value String name File
     * @return Boolean true/false
     */
    @SneakyThrows
    private Boolean compareFiles(File value) {
        try (FileInputStream fis1 = new FileInputStream(value);
             FileInputStream fis2 = new FileInputStream(getValue())) {

            byte[] buffer1 = new byte[1024];
            byte[] buffer2 = new byte[1024];

            int bytesRead1;
            int bytesRead2;

            while ((bytesRead1 = fis1.read(buffer1)) != -1) {
                bytesRead2 = fis2.read(buffer2);
                if (bytesRead1 != bytesRead2 || !Arrays.equals(buffer1, buffer2)) {
                    return false;
                }
            }

            return fis2.read(buffer2) == -1;
        }
    }

    private File getValueFile() {
        return getFieldByName().$("button").download(DownloadOptions.using(FOLDER));
    }

    private File getFile(String value) {
        ClassLoader classLoader = getClass().getClassLoader();
        URL resource = classLoader.getResource(value);

        if (resource == null) {
            throw new IllegalArgumentException("file is not found!");
        } else {
            return new File(resource.getFile());
        }
    }

    /**
     * Getting the name of the downloaded file
     *
     * @return String
     */
    public String getValueName() {
        return Allure.step("Getting the name of the downloaded file", step -> {
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
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    public String getHexColor() {
        throw new UnsupportedOperationException("getHexColor not supported for FileUpload on Info");
    }

    /**
     * This method is not available..
     *
     * @return UnsupportedOperationException
     */
    @Step("Clicking on a hyperlink in the text or by clicking on a special element")
    public Boolean drillDown() {
        throw new UnsupportedOperationException("drillDown not supported for FileUpload on Info");
    }

}

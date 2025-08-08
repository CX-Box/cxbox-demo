package core.widget.addfiles;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.tuple.Pair;

public class FilesPopup {

    private final SelenideElement popup = $("div[class=\"ant-notification ant-notification-topRight\"]");
    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Getting the header value
     *
     * @return String
     */

    public String getTitle() {
        return Allure.step("Getting the header value", step -> {
            logTime(step);

            return popup
                    .$("div[class=\"ant-notification-notice-message\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });
    }

    /**
     * Getting a list of files and their status
     *
     * @return List Pair
     */

    public List<Pair<String, String>> getFileNameAndStatusUpload() {
        return Allure.step("Getting a list of files and their status", step -> {
            logTime(step);

            List<Pair<String, String>> pairs = new ArrayList<Pair<String, String>>();
            for (SelenideElement file : getFilesList()) {
                String key = file.getAttribute("data-test-file-name");
                String value = file.getAttribute("data-test-file-status");
                pairs.add(Pair.of(key, value));
            }
            return pairs;
        });
    }

    /**
     * Closing window
     */
    public void close() {
        Allure.step("Closing window", step -> {
            logTime(step);

            popup
                    .$("i[aria-label=\"icon: close\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });

    }

    private ElementsCollection getFilesList() {
        return popup
                .$("div[data-test-file-upload-prgress-list=\"true\"]")
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("div[class*=\"UploadList__fileRow\"]");
    }
}

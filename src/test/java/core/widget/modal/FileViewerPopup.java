package core.widget.modal;

import static com.codeborne.selenide.DownloadOptions.using;
import static com.codeborne.selenide.FileDownloadMode.FOLDER;
import static com.codeborne.selenide.WebDriverRunner.getWebDriver;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.io.File;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.WebDriverWait;

@RequiredArgsConstructor
public class FileViewerPopup {

    private final SelenideElement popup;

    private final SelenideElement widget;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Getting the header
     *
     * @return String
     */
    public String getTitle() {
        return Allure.step("Getting the header", step -> {
            logTime(step);

            return popup
                    .$("span[class*=\"Header__title\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });

    }

    private String getTypeWidget() {
        return widget.getAttribute("data-test-widget-type");
    }

    private ElementsCollection getButtons() {
        return popup.$$(By.tagName("button"));
    }

    /**
     * Clicking on the button FullScreen
     */
    public void switchFullscreenMode() {
        Allure.step("Clicking on the button FullScreen", step -> {
            logTime(step);

            getButtons()
                    .findBy(Condition.text("Fullscreen"))
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });

    }

    /**
     * Getting a file from a field in File format
     *
     * @return File
     */
    @SneakyThrows
    public File getValueFile() {
        return Allure.step("Getting a file from a field in File format", step -> {
            logTime(step);

            File file = getButtons()
                    .findBy(Condition.text("Download"))
                    .download(using(FOLDER));
            WebDriverWait wait = new WebDriverWait(getWebDriver(), Duration.ofSeconds(waitingForTests.Timeout));
            wait.until(driver -> file.exists());
            return file;
        });

    }

    /**
     * Pagination management in FileViewerPopup
     *
     * @param button Button name Left/Right
     * @param count  Number of clicks
     */
    public void clickPaginationButton(String button, int count) {
        Allure.step("Page navigation. Clicking on " + button + ", " + count + " times", step -> {
            logTime(step);
            step.parameter("Button's name", button);
            step.parameter("Count of click", count);

            SelenideElement element = popup.$("div[class*=\"ArrowPagination__compact\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
            for (int i = 0; i < count; i++) {
                if (button.equalsIgnoreCase("left") | button.equalsIgnoreCase("влево")) {
                    element
                            .$("i[aria-label=\"icon: left\"]")
                            .parent()
                            .click();
                }
                if (button.equalsIgnoreCase("right") | button.equalsIgnoreCase("вправо")) {
                    element
                            .$("i[aria-label=\"icon: right\"]")
                            .parent()
                            .click();
                } else {
                    throw new UnsupportedOperationException("No such button exists");
                }
            }
        });


    }

    /**
     * Getting the current page
     *
     * @return 1 of 3
     */
    public String getPagePagination() {
        return Allure.step("Getting the current page", step -> {
            logTime(step);

            return popup
                    .$("div[class*=\"ArrowPagination__compact\"]")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .getText();
        });
    }

    /**
     * Closing FileViewer Popup
     */
    public void closePopup() {
        Allure.step("Closing FileViewer Popup", step -> {
            logTime(step);

            popup.$("div[class=\"ant-modal-header\"]")
                    .$("i[aria-label=\"icon: close\"]")
                    .scrollIntoView("{block: \"center\"}")
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }
}

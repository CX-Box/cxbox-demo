package core.widget.filter;

import static com.codeborne.selenide.DownloadOptions.using;
import static com.codeborne.selenide.FileDownloadMode.FOLDER;
import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.io.File;
import java.time.Duration;
import java.util.List;
import lombok.SneakyThrows;

public class GearMenu {
    final SelenideElement MENU = $("ul[class=\"ant-dropdown-menu ant-dropdown-menu-light ant-dropdown-menu-root ant-dropdown-menu-vertical\"]");

    protected final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    private ElementsCollection getMenuItems() {
        return MENU
                .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("li[role=\"menuitem\"]");
    }

    /**
     * Getting a list of options menu
     *
     * @return List(String)
     */

    public List<String> getOptions() {
        return Allure.step("Getting a list of options menu", step -> {
            logTime(step);

            return getMenuItems().texts();
        });
    }

    /**
     * Selecting an option in the menu
     *
     * @param option The name of the option. Use a separate method for exporting
     */

    public void setOption(String option) {
        Allure.step("Selecting an option " + option + " in the menu", step -> {
            logTime(step);
            step.parameter("option", option);
            getMenuItems()
                    .findBy(Condition.text(option))
                    .click();
        });

    }

    /**
     * Exporting a file
     *
     * @return File table in Excel
     */

    @SneakyThrows
    public File getExportFile() {
        return Allure.step("Exporting a file", step -> {
            logTime(step);
            return getMenuItems()
                    .findBy(Condition.text("Excel"))
                    .download(using(FOLDER));
        });
    }
}

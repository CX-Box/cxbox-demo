package core;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Allure;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MainPages {

    //TODO Remove Main_Menu
    public static final SelenideElement MAIN_MENU = ContextUtils.LEFT_SIDER
            .$("ul[data-test='MAIN_MENU']");

    private static final ElementsCollection MAIN_SECTIONS = MAIN_MENU
            .$$("li[data-test='MAIN_MENU_ITEM']");

    /**
     * Select a section in the left menu
     *
     * @param sectionName Section name
     * @serialData DateTime
     */

    public static void click(String sectionName) {
        Allure.step("Selecting the " + sectionName + " section in the left menu.", step -> {
            step.parameter("sectionName", sectionName);
            logTime(step);
            MAIN_SECTIONS
                    .find(Condition.exactText(sectionName))
                    .shouldBe(Condition.enabled)
                    .click();
            checkPagesLoad();
        });
    }


    public static class FirstLevelMenu {

        private static final ElementsCollection FIRST_LEVEL_SECTIONS = $(
                "div[data-test-widget-name='SecondLevelMenu']")
                .$$("span[data-test-navigation-tabs-item='true']");

        /**
         * Selecting a tab on a page
         *
         * @param sectionName Name of the tab
         */
        public static void click(String sectionName) {
            Allure.step("Selecting a tab " + sectionName + " on a page", step -> {
                logTime(step);
                step.parameter("Name of tab", sectionName);

                FIRST_LEVEL_SECTIONS
                        .find(Condition.exactText(sectionName))
                        .shouldBe(Condition.enabled)
                        .click();
                checkPagesLoad();
            });

        }
    }

    public static class SecondLevelMenu {

        private static final ElementsCollection FIRST_LEVEL_SECTIONS = $(
                "div[data-test-widget-name='ThirdLevelMenu']")
                .$$("span[data-test-navigation-tabs-item='true']");


        /**
         * Selecting a tab on a page
         *
         * @param sectionName Name of the tab
         */
        public static void click(String sectionName) {
            Allure.step("Selecting a tab " + sectionName + " on a page", step -> {
                logTime(step);
                step.parameter("Name of tab", sectionName);

                FIRST_LEVEL_SECTIONS
                        .find(Condition.exactText(sectionName))
                        .shouldBe(Condition.enabled)
                        .click();
                checkPagesLoad();
            });

        }
    }

    /**
     * Waiting for the page to load
     */
    private static void checkPagesLoad() {
        SelenideElement element = $("div[data-test-loading=\"true\"]");
        log.debug("data-test-loading=true check -> started. exists:  " + element.exists());
        element.shouldNotBe(Condition.exist, Duration.ofSeconds(2));
        log.debug("data-test-loading=true check -> finished. exists: " + element.exists());
    }
}

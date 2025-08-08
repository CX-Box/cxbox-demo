package core.widget.modal;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.*;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;

@Slf4j
public class Calendar {
    private static final SelenideElement PANEL_CALENDAR = $("div[class=\"ant-calendar-panel\"]");
    private static final SelenideElement TIME_PANEL_CALENDAR = $("div[class=\"ant-time-picker-panel-inner\"]");
    public static CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Initialization of the Calendar window, after opening.
     * If there is no window, click in the field.
     *
     * @param field Field
     */
    public static void findCalendar(SelenideElement field) {
        Allure.step("Validating the calendar window", step -> {
            logTime(step);
            step.parameter("Field", field);

            if (PANEL_CALENDAR.is(Condition.disappear)) {
                field
                        .$("i[aria-label=\"icon: calendar\"]")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .click();
            }
        });
    }

    /**
     * Clearing the calendar
     */
    public static void clear() {
        Allure.step("Clearing the field in calendar", step -> {
            logTime(step);

            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.editable, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.BACK_SPACE);
        });
    }

    /**
     * Setup date
     *
     * @param date LocalDate
     */
    public static void setDate(LocalDate date) {
        Allure.step("Setting the " + date + " in calendar", step -> {
            logTime(step);
            step.parameter("Date", date);

            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(formattedDate(date));
            Selenide.sleep(200);
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldHave(Condition.value(formattedDate(date)));
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.ENTER);

        });
    }


    /**
     * Set date
     *
     * @param dateTime LocalDateTime
     */
    public static void setDateTime(LocalDateTime dateTime) {
        Allure.step("Setting the " + dateTime + " in calendar", step -> {
            logTime(step);
            step.parameter("DateTime", dateTime);

            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(formattedDateTime(dateTime));
            Selenide.sleep(200);
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldHave(Condition.value(formattedDateTime(dateTime)));
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.ENTER);
        });

    }

    /**
     * Set date
     *
     * @param dateTimeWithSeconds LocalDateTime
     */
    public static void setDateTimeWithSecond(LocalDateTime dateTimeWithSeconds) {
        Allure.step("Setting the " + dateTimeWithSeconds + " in calendar", step -> {
            logTime(step);
            step.parameter("LocalDateTime with sec", dateTimeWithSeconds);

            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(formattedDateTimeWithSecond(dateTimeWithSeconds));
            Selenide.sleep(200);
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldHave(Condition.value(formattedDateTimeWithSecond(dateTimeWithSeconds)));
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.ENTER);
        });

    }

    public static void setTimeWithSecond(LocalDateTime time, String format) {
        Allure.step("Setting the " + time + " in calendar", step -> {
            logTime(step);
            step.parameter("LocalDateTime with sec", time);

            TIME_PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            TIME_PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .setValue(formattedTimeWithSecond(time, format));
            Selenide.sleep(200);
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            TIME_PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .shouldHave(Condition.value(formattedTimeWithSecond(time, format)));
            if (Selenide.$(By.cssSelector("div[data-test-error-popup=\"true\"")).exists()) {
                return;
            }
            TIME_PANEL_CALENDAR
                    .$("input")
                    .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                    .sendKeys(Keys.ENTER);
        });

    }

    /**
     * Set the date for today
     */
    public static void setToday() {
        Allure.step("Set the date for today", step -> {
            logTime(step);

            PANEL_CALENDAR
                    .$("a[class=\"ant-calendar-today-btn \"]")
                    .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                    .click();
        });
    }

    private static SelenideElement getContainer() {
        return PANEL_CALENDAR
                .shouldBe(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .scrollIntoView("{block: \"center\"}");
    }

    private static ElementsCollection getContainersActions() {
        return getContainer()
                .$$(By.tagName("a"))
                .shouldBe(CollectionCondition.sizeGreaterThan(0));
    }

    private static SelenideElement getButton(String actionName) {
        return getContainersActions()
                .find(Condition.match("check action name: " + actionName, b -> b.getText().equals(actionName)));
    }

    /**
     * Clicking on the button by Name
     *
     * @param actionName Button's name
     */
    public static void clickButton(String actionName) {
        Allure.step("Clicking on the button " + actionName + " in calendar", step -> {
            logTime(step);
            step.parameter("Button's name", actionName);

            SelenideElement button = getButton(actionName);
            button.shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout)).click();
        });

    }

    public static String formattedDate(LocalDate date) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            return date.format(formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Некорректный формат даты. Должен быть dd.MM.yyyy");
        }
    }

    public static String formattedDateTime(LocalDateTime date) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
            return date.format(formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Некорректный формат даты. Должен быть dd.MM.yyyy HH:mm");
        }
    }

    private static String formattedDateTimeWithSecond(LocalDateTime date) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
            return date.format(formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Некорректный формат даты. Должен быть dd.MM.yyyy HH:mm:ss");
        }
    }

    private static String formattedTimeWithSecond(LocalDateTime date, String format) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(format);
            return date.format(formatter);
        } catch (Exception e) {
            throw new IllegalArgumentException("Некорректный формат даты. Должен быть dd.MM.yyyy HH:mm:ss");
        }
    }


}

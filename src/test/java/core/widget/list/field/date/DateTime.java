package core.widget.list.field.date;

import static com.codeborne.selenide.Selenide.$;
import static core.widget.modal.Calendar.formattedDateTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.SelenideElement;
import core.widget.ListHelper;
import core.widget.TestingTools.Constants;
import core.widget.list.ListWidget;
import core.widget.list.field.BaseRow;
import core.widget.modal.Calendar;
import io.qameta.allure.Step;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.openqa.selenium.By;

public class DateTime extends BaseRow<LocalDateTime> {
    public DateTime(ListWidget listWidget, String title, String id, ListHelper listHelper, Boolean sort, Boolean filter) {
        super(listWidget, title, "dateTime", id, listHelper, sort, filter);
    }

    private static final SelenideElement PANEL_CALENDAR = $("div[class=\"ant-calendar-panel\"]");

    /**
     * Setting the date in the calendar
     *
     * @param value LocalDateTime
     *              {@code example} LocalDateTime dateTime = LocalDateTime.of(2020,10,10,10,10)
     */
    @Override
    @Step("Setting the {value} in the field")
    public void setValue(LocalDateTime value) {
        setFocusField();
        clearIcon();
        getRowByName().click();
        Calendar.setDateTime(value);
    }

    public void setValueManual(LocalDateTime value) {
        setFocusField();
        clearIcon();
        getRowByName().click();
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
                .setValue(formattedDateTime(value));
    }

    /**
     * Getting the date in the data type -  LocalDateTime
     *
     * @return LocalDateTime
     * {@code example} LocalDateTime.of(2020, 10, 10, 10, 10)
     */
    @Override
    @Step("Getting a value from a field")
    public LocalDateTime getValue() {
        setFocusField();
        String date = getRowByName()
                .shouldBe(Condition.exist)
                .$(getValueTag())
                .getValue();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
        assert date != null;
        return LocalDateTime.parse(date, formatter);
    }

    @Override
    public String getValueTag() {
        return "input";
    }

    /**
     * Clearing the field through the cross icon.
     */
    @Step("Clearing the field")
    public void clearIcon() {
        setFocusField();
        getRowByName()
                .$("i[aria-label=\"icon: close-circle\"]")
                .hover()
                .shouldBe(Condition.enabled, Duration.ofSeconds(waitingForTests.Timeout))
                .click();
    }

    /**
     * Getting the field color in Hex format
     *
     * @return String/null
     */
    @Step("Getting the field color in Hex format")
    public String getHexColor() {
        setFocusField();
        String color = getValueByAttribute(1, "span", "style");
        Pattern pattern = Pattern.compile("rgb\\((\\d{1,3}, \\d{1,3}, \\d{1,3})\\)");
        Matcher matcher = pattern.matcher(color);

        if (matcher.find()) {
            String rgb = matcher.group(1);
            String NewRGB = rgb.replaceAll(" ", "");
            String[] strings = NewRGB.split("[,\\\\s]+");
            int[] numbers = new int[strings.length];
            for (int i = 0; i < strings.length; i++) {
                numbers[i] = Integer.parseInt(strings[i]);
            }
            return String.format(Constants.FormatForRgb, numbers[0], numbers[1], numbers[2]);
        } else {
            return null;
        }
    }
}

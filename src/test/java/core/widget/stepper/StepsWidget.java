package core.widget.stepper;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.tuple.Pair;

@RequiredArgsConstructor
@Getter
public class StepsWidget {
    protected final SelenideElement widget;
    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    private ElementsCollection steps() {
        return widget
                .should(Condition.exist, Duration.ofSeconds(waitingForTests.Timeout))
                .should(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                .$$("div[class=\"ant-steps-item-container\"]");
    }

    /**
     * Getting the number and text of the steps
     *
     * @return Pair Integer, String
     */

    public List<Pair<Integer, String>> getNumberAndTextSteps() {
        return Allure.step("Getting the number and text of the steps", step -> {
            logTime(step);

            waitingForTests.getWaitAllElements(widget);
            List<Pair<Integer, String>> pairs = new ArrayList<>();
            steps().forEach(stepSE -> {
                Integer number = Integer.valueOf(stepSE.$("div[class=\"ant-steps-item-icon\"]")
                        .should(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .text());
                String text = stepSE.$("div[class=\"ant-steps-item-title\"]")
                        .should(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .text();
                pairs.add(Pair.of(number, text));

            });
            return pairs;
        });

    }

    /**
     * Getting the number and text of the selected step
     *
     * @param stepIndex The step number. Counting down from 1
     * @return String
     */

    public String getStepText(int stepIndex) {
        return Allure.step("Getting the number and text for " + stepIndex + "  steps", step -> {
            logTime(step);
            step.parameter("Step number", stepIndex);

            waitingForTests.getWaitAllElements(widget);
            SelenideElement element = steps().get(stepIndex - 1);
            String number = element.$("div[class=\"ant-steps-item-icon\"]")
                    .should(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
            String text = element.$("div[class=\"ant-steps-item-title\"]")
                    .should(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                    .text();
            return (number + ", " + text);
        });

    }

    /**
     * Getting the number and text of the active/current step
     *
     * @return String
     */

    public String getTextActiveStep() {
        return Allure.step("Getting the number and text of the active/current step", step -> {
            logTime(step);

            SelenideElement activeElement = widget
                    .$("div[class=\"ant-steps-item ant-steps-item-process ant-steps-item-active\"]")
                    .should(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
            waitingForTests.getWaitAllElements(activeElement);
            String number = activeElement.$("div[class=\"ant-steps-item-icon\"]").text();
            String text = activeElement.$("div[class=\"ant-steps-item-title\"]").text();
            return (number + ", " + text);
        });
    }
}

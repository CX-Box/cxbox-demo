package core.widget.statsBlock;

import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;
import core.OriginExpectations.CxBoxExpectations;
import io.qameta.allure.Allure;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Getter
@Slf4j
public class StatsBlockWidget {
    protected final String title;

    protected final SelenideElement widget;

    private final CxBoxExpectations waitingForTests = new CxBoxExpectations();

    /**
     * Block validation by heading
     *
     * @param title Title
     * @return statBlock
     */

    public Optional<statBlock> findStatBlock(String title) {
        return Allure.step("Block validation " + title, step -> {
            logTime(step);
            step.parameter("Title", title);

            SelenideElement block = widget.$$("div[class=\"ant-col ant-col-4 ant-col-sm-8\"]")
                    .findBy(Condition.text(title))
                    .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout));
            if (block.is(Condition.visible)) {
                return Optional.of(new statBlock(block));
            } else {
                return Optional.empty();
            }
        });
    }

    /**
     * Getting all block headers
     *
     * @return List(String)
     */

    public List<String> getTitleBlocks() {
        return Allure.step("Getting all block headers", step -> {
            logTime(step);

            List<String> titles = new ArrayList<>();
            ElementsCollection blocks = widget.$$("div[class=\"ant-col ant-col-4 ant-col-sm-8\"]");
            for (SelenideElement block : blocks) {
                String text = block.$("div[class*=\"StatsBlock__itemContent\"] div:nth-child(2)")
                        .shouldBe(Condition.visible, Duration.ofSeconds(waitingForTests.Timeout))
                        .getText();
                titles.add(text);
                log.info(String.valueOf(block));
            }
            return titles;
        });
    }
}

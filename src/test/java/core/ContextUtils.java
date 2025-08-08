package core;

import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import org.openqa.selenium.By;

public class ContextUtils {

    public static final SelenideElement MAIN_CONTEXT = $("section[class*='appLayout']")
            .$("main[class*='ant-layout-content']");

    public static final SelenideElement LEFT_SIDER = $("aside[data-test='LEFT_SIDER']");

    public static final SelenideElement MODAL_WINDOW = $$("div[class^='ant-modal-mask']")
            .filter(Condition.not(Condition.hidden)).first()
            .$(By.xpath(".."))
            .$(By.cssSelector("div[class='ant-modal-content']"));
}

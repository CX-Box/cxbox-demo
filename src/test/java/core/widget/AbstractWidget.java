package core.widget;

import com.codeborne.selenide.ElementsCollection;
import com.codeborne.selenide.SelenideElement;

public abstract class AbstractWidget {

    protected SelenideElement widget;

    protected ElementsCollection items;

    AbstractWidget(SelenideElement widget, ElementsCollection items) {
        this.widget = widget;
        this.items = items;
    }

}

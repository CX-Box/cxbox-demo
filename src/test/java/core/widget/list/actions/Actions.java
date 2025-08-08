package core.widget.list.actions;

import java.util.List;

public interface Actions {

    void click(String actionName);

    void clickWithErrors(String actionName);

    List<String> getActions();
}

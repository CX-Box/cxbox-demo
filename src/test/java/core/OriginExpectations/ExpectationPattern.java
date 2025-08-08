package core.OriginExpectations;

import com.codeborne.selenide.SelenideElement;

public interface ExpectationPattern {
    /**
     * Waiting time in seconds
     *
     * @return Integer
     */
    Integer getTimeout();

    /**
     * Number of repetitions
     *
     * @return Integer
     */
    Integer getRetryNumber();

    /**
     * Waiting time in milliseconds
     *
     * @return Integer
     */
    Integer getTimeoutMilliseconds();

    /**
     * Waiting for all items in the left menu to be visible
     */
    void getContextMenu();

    /**
     * Waiting for the widget and all the elements in it to load
     *
     * @param title Widget title
     */
    void getWaitAllElementsWidget(String title);

    /**
     * Waiting for all rows in the List or GroupingHierarchy widget
     *
     * @param title Widget title
     */
    void getWaitAllRowsWidget(String title);

    /**
     * Waiting for all fields on the page
     */
    void getWaitAllFields();

    /**
     * Waiting for a specific element
     *
     * @param type  Element type (example: field)
     * @param title Element title (example: client)
     */
    void getWaitElement(String type, String title);

    /**
     * Waiting for all elements according to the specified  SelenideElement
     *
     * @param webElement web element, it is recommended to link to elements with unique attributes
     */
    void getWaitAllElements(SelenideElement webElement);

    /**
     * Waiting for all elements according to the specified  CSS-селектору
     *
     * @param cssSelector web element, it is recommended to link to elements with unique attributes
     */
    void getWaitAllElements(String cssSelector);
}

package core.widget.TestingTools;

import java.util.List;

/**
 * Constants for tests
 */
public class Constants {

    public static List<String> list = List.of(
            "This field is mandatory",
            "Custom message about error"
    );

    /**
     * Error Window Constants
     */
    public static class ErrorPopup {
        /**
         * Window title
         */
        public static final String ErrorTitle = "Error";
    }

    /**
     * Confirmation Window Constants
     */
    public static class ConfirmPopup {
        /**
         * Window title
         */
        public static final String ConfirmTitle = "Are you sure?";
    }

    public static final String MoreThatCurrentDate = "The field cannot be less than the current date";
    public static final String MoreThatNumber = "The field cannot be less than 20 000.";
    public static final String MoreThatPercent = "The field cannot be less than 10%.";
    public static final String SystemError = "System error has been occurred";
    public static final String SaveValue = "You want to save the value ?";
    public static final String InvalidNumberDigits = "The field cannot be less than 100 000.00.";
    public static final String InvalidNumber = "The field cannot be less than 100 000.";
    public static final String RequiredMessage = "This field is mandatory";
    public static final String MessageAboutError = "Custom message about error";
    public static final String OnlyLetters = "The field can contain only letters.";
    public static final String RequiredField = "Custom message about required field";
    public static final String FormatForRgb = "#%02X%02X%02X";
}

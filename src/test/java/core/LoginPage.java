package core;

import static com.codeborne.selenide.Selenide.$x;
import static core.widget.TestingTools.CellProcessor.logTime;

import com.codeborne.selenide.Condition;
import com.codeborne.selenide.SelenideElement;
import io.qameta.allure.Allure;
import java.net.URI;

public class LoginPage {

    public static final SelenideElement login = $x("//*[@id='username']");

    public static final SelenideElement password = $x("//*[@id='password']");

    public static final SelenideElement signInButton = $x("//*[@id='kc-login']");

    //TODO>>login has high costs. Try to remove logout. Instead login only if needed without selenide at all
    public static void keycloakLogin(String login, String password, URI appUri) {
        Allure.step(
                "Authorization via KeyCloak with login: " + login + " and password", step -> {
                    logTime(step);
                    step.parameter("login", login);
                    enterUsername(login);
                    enterPassword(password);
                    clickSignInButton();
                }
        );
    }


    private static void enterUsername(String login) {
        Allure.step(
                "Entering a username: " + login, step -> {
                    logTime(step);
                    step.parameter("login", login);
                    LoginPage.login
                            .shouldBe(Condition.enabled)
                            .setValue(login);
                }
        );
    }

    private static void enterPassword(String password) {
        Allure.step(
                "Entering a password", step -> {
                    logTime(step);
                    LoginPage.password
                            .shouldBe(Condition.enabled)
                            .setValue(password);
                }
        );
    }

    private static void clickSignInButton() {
        Allure.step(
                "Clicking on the Login button", step -> {
                    logTime(step);
                    signInButton
                            .shouldBe(Condition.visible)
                            .click();
                }
        );
    }


}

package application.config;

import static core.widget.TestingTools.CellProcessor.logTime;

import application.config.props.Env;
import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.Selenide;
import com.codeborne.selenide.logevents.SelenideLogger;
import com.codeborne.selenide.proxy.SelenideProxyServerFactory;
import com.google.auto.service.AutoService;
import core.LoginPage;
import core.TestApplicationContext;
import core.config.allure.AbstractAllureDescAppender;
import core.config.junit.AllurePerTestLog;
import core.config.selenide.AbstractLoggingProxyServer;
import core.config.selenide.AllureVideoRecorder;
import core.widget.TestingTools.AppChecks;
import io.github.bonigarcia.wdm.WebDriverManager;
import io.qameta.allure.Allure;
import io.qameta.allure.junit5.AllureJunit5;
import io.qameta.allure.listener.TestLifecycleListener;
import io.qameta.allure.selenide.AllureSelenide;
import io.qameta.allure.selenide.LogType;
import java.time.Duration;
import java.util.Map;
import java.util.logging.Level;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LoggingPreferences;
import org.selenide.videorecorder.core.RecordingMode;
import org.selenide.videorecorder.core.VideoSaveMode;

/**
 * Use @ExtendWith({JvmStatsPerTest.class.class}) to see CPU/RAM after each test. Turn off after debugging
 */
@Slf4j
@ExtendWith({AllureJunit5.class})
@DisplayName("Setup for Samples Tests")
@ExtendWith({AllureVideoRecorder.class})
public abstract class BaseTestForSamples {

    /**
     * singleton with whole cxbox-test-dsl context. thread-safe. immutable
     */
    public static final TestApplicationContext $box = new TestApplicationContext();

    @RegisterExtension
    private static final AllurePerTestLog apiLogNoLogin = new AllurePerTestLog(
            "Network logs (except login)",
            "API_NO_LOGIN_LOGGER"
    );

    @BeforeAll
    public static void setUpAllure() {
        WebDriverManager.chromedriver().setup();
        Configuration.browser = "chrome";
        Configuration.headless = false;
        Configuration.timeout = 10000;
        Configuration.browserSize = "1280x800";
        Configuration.pageLoadTimeout = 60000;
        Configuration.webdriverLogsEnabled = false;
        Configuration.reportsFolder = "target/videos";
        if (Env.logEnabled()) {
            Configuration.proxyEnabled = true;
        }
        if (Env.videoEnabled()) {
            System.setProperty("selenide.video.enabled", String.valueOf(true));
            System.setProperty("selenide.video.save.mode", VideoSaveMode.FAILED_ONLY.name());
            System.setProperty("selenide.video.directory", "target/videos");
            System.setProperty("selenide.video.mode", RecordingMode.ALL.name());
            System.setProperty("selenide.video.fps", String.valueOf(10));
            //0 (lossless) to 51 (the lowest quality)
            System.setProperty("selenide.video.crf", String.valueOf(0));
        }
        Configuration.browserCapabilities = getChromeOptions();

        SelenideLogger.addListener(
                AllureSelenide.class.getName(),
                new AllureSelenide()
                        .enableLogs(LogType.BROWSER, Env.logEnabled() ? Level.ALL : Level.OFF)
                        .includeSelenideSteps(false)
                        .screenshots(true)
                        .savePageSource(true)
        );
        AppChecks.waitAppLoginPageReady(Env.uri(), Duration.ofMinutes(5), Duration.ofSeconds(5));
    }

    @NonNull
    private static ChromeOptions getChromeOptions() {
        var options = new ChromeOptions().addArguments(
                "--enable-automation",
                "--remote-allow-origins=*",
                "--disable-features=InsecureDownloadWarnings",
             		"--disable-features=UpgradeInsecureRequests",
                "--unsafely-treat-insecure-origin-as-secure=http://demo.cxbox.org/",
                "--unsafely-treat-insecure-origin-as-secure=http://code-samples.cxbox.org/ui/#",
                "--disable-popup-blocking",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-software-rasterizer",
                "--disable-gpu",
                "--disable-web-security",
                "--disable-notifications",
                "--disable-background-networking",
                "--disable-component-update",
                "--disable-default-apps",
                "--disable-sync",
                "--metrics-recording-only",
                "--safebrowsing-disable-auto-update",
                "--no-first-run",
                "--no-default-browser-check",
                "--disable-translate"
        );
        options.setAcceptInsecureCerts(true);
        if (Env.logEnabled()) {
            var pref = new LoggingPreferences();
            pref.enable(LogType.BROWSER.toString(), Level.ALL);
            options.setCapability("goog:loggingPrefs", pref);
        }
        System.setProperty("chromeoptions.prefs", "credentials_enable_service=false, password_manager_enabled=false");
        return options;
    }

    @BeforeEach
    public void beforeEach() {
        Allure.step(
                "Logout and login from scratch", step -> {
                    logTime(step);
                    Selenide.open(AppChecks.logoutAndRedirectToLoginPageUri(Env.uri()));
                    LoginPage.keycloakLogin("demo", "demo", Env.uri());
                }
        );
    }

    @SuppressWarnings("unused")
    @AutoService(SelenideProxyServerFactory.class)
    public static class LoggingProxyServer extends AbstractLoggingProxyServer {

        public LoggingProxyServer() {
            super(Map.of(
                    "1", new ProxyLogFilter(
                            url -> url.contains("api/v1/") && !url.contains("api/v1/login"),
                            apiLogNoLogin.getPerTestLogger()::trace
                    )
            ));
        }

    }

    @SuppressWarnings("unused")
    @AutoService(TestLifecycleListener.class)
    public static class AllureDescAppender extends AbstractAllureDescAppender {

        public AllureDescAppender() {
            super("""
                    into <a href="https://github.com/CX-Box/cxbox-code-samples/actions/workflows/build_button_qa.yml" target="_blank">GitHub Actions</a> 
                    → <strong>Run Workflow</strong> 
                    → <strong>include PATH</strong>
                    """);
        }

    }

}

package core.config.junit;

import static java.lang.String.format;

import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.FileAppender;
import io.qameta.allure.Allure;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import lombok.SneakyThrows;
import net.jcip.annotations.ThreadSafe;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JUnit 5 extension for per-test logging with Allure report integration.
 * <p>
 * This extension creates a unique log file for each test execution using Logback,
 * and automatically attaches the log to the Allure report if the test fails.
 * </p>
 *
 * <h3>Usage Example:</h3>
 * <pre>{@code
 *
 * class SomeTest {
 *
 *     @RegisterExtension
 *     private static final AllurePerTestLog networkLogger =
 *         new AllurePerTestLog("Network log", "network_log");
 *
 *     @Test
 *     void testNetworkCall() {
 *         networkLogger.getPerTestLogger().info("Executing network request...");
 *         // test logic
 *     }
 * }
 * }</pre>
 *
 * <h3>Logback Configuration (logback-test.xml):</h3>
 * <pre>{@code
 * <configuration>
 *
 * <!-- This logger matches the name passed to AllurePerTestLog. MUST BE in logback-test.xml -->
 *  <logger name="network_log" level="TRACE" additivity="false"/>
 *
 * </configuration>
 * }</pre>
 *
 * <p><strong>Note:</strong> Requires Allure to be configured in your project for attachments to be visible.</p>
 */
//TODO>>refactor. just draft
@ThreadSafe
public class AllurePerTestLog implements BeforeEachCallback, AfterEachCallback {

    private final String allureAttachmentName;

    private final String loggerName;

    private final Logger logger;

    public AllurePerTestLog(String allureAttachmentName, String loggerName) {
        this.allureAttachmentName = allureAttachmentName;
        this.loggerName = loggerName;
        this.logger = LoggerFactory.getLogger(loggerName);
    }

    public Logger getPerTestLogger() {
        return logger;
    }

    private static String sanitizeFileName(String input) {
        return input.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
    }

    @NotNull
    private static FileAppender<ILoggingEvent> getILoggingEventFileAppender(String perTestFileName) {
        var logFile = new File("target/log/", perTestFileName + UUID.randomUUID() + ".log");

        var context = (LoggerContext) LoggerFactory.getILoggerFactory();

        // Create encoder
        var encoder = new PatternLayoutEncoder();
        encoder.setContext(context);
        encoder.setPattern("%d{HH:mm:ss.SSS} [%thread] %-5level %logger{15} - %msg %n");
        encoder.start();

        // Create file appender
        var fileAppender = new FileAppender<ILoggingEvent>();
        fileAppender.setContext(context);
        fileAppender.setName(perTestFileName);
        fileAppender.setFile(logFile.getAbsolutePath());
        fileAppender.setEncoder(encoder);
        fileAppender.setAppend(true);

        return fileAppender;
    }

    @NotNull
    private String getPerTestUniqueAppenderName(ExtensionContext context) {
        return loggerName + sanitizeFileName(format("-%s", context.getUniqueId()));
    }

    @Override
    public void beforeEach(ExtensionContext context) {
        var perTestFileName = getPerTestUniqueAppenderName(context);
        var logback = (ch.qos.logback.classic.Logger) this.logger;
        var fileAppender = getILoggingEventFileAppender(perTestFileName);
        var appender = logback.getAppender(perTestFileName);
        if (appender == null) {
            logback.addAppender(fileAppender);
            fileAppender.start();
        }

        logback.trace("starting test: {}. uuid: {}", context.getDisplayName(), context.getUniqueId());
    }

    @Override
    @SneakyThrows
    public void afterEach(ExtensionContext context) {
        var perTestFileName = getPerTestUniqueAppenderName(context);
        logger.trace("ending test: {}. uuid: {}", context.getDisplayName(), context.getUniqueId());

        var logback = (ch.qos.logback.classic.Logger) LoggerFactory.getLogger(loggerName);
        var appender = logback.getAppender(perTestFileName);

        if (appender != null) {
            logback.detachAppender(perTestFileName);
            appender.stop();
            var file = ((FileAppender<?>) appender).getFile();
            var logFile = Path.of(file);
            if (context.getExecutionException().isPresent()) {
                Allure.addAttachment(allureAttachmentName, Files.newInputStream(logFile));
            }
        }

    }


}

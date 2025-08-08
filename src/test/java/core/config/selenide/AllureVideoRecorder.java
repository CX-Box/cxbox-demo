package core.config.selenide;

import core.util.FileUtil;
import io.qameta.allure.Allure;
import lombok.extern.slf4j.Slf4j;
import net.jcip.annotations.ThreadSafe;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.selenide.videorecorder.junit5.VideoRecorderExtension;

/**
 * The AllureVideoRecorder class extends the VideoRecorderExtension to enable attaching recorded test execution videos
 * to Allure reports for failed tests.
 *
 * <h5>Usage Example</h5>
 * <pre>{@code
 * @ExtendWith( {AllureJunit5.class, AllureVideoRecorder.class} )
 * public class MyTestForSamples {
 * }
 * }</pre>
 */
@Slf4j
@ThreadSafe
public class AllureVideoRecorder extends VideoRecorderExtension {

    @Override
    protected void afterTestExecution(ExtensionContext context, boolean testFailed) {
        super.afterTestExecution(context, testFailed);
        if (testFailed) {
            VideoRecorderExtension.getRecordedVideo().ifPresent(video -> Allure.addAttachment(
                    "Video",
                    "video/webm",
                    FileUtil.newInputStreamSneaky(video),
                    ".webm"
            ));
        }
    }

}

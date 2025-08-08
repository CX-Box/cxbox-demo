package core.config.junit;

import com.sun.management.OperatingSystemMXBean;
import java.lang.management.ManagementFactory;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import net.jcip.annotations.ThreadSafe;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

/**
 * JUnit 5 extension that logs JVM performance metrics (RAM, CPU) after each test execution.
 * <h5>Usage Example</h5>
 * <pre>{@code
 * @ExtendWith( {JvmStatsPerTest.class} )
 * public class MyTestForSamples {
 * }
 * }</pre>
 */
@Slf4j
@ThreadSafe
public class JvmStatsPerTest implements BeforeEachCallback, AfterEachCallback {

    public static String getJvmPerf() {
        var os = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
        var runtime = Runtime.getRuntime();
        var totalJVMRamMb = (runtime.totalMemory()) / (1024 * 1024);
        var freeJVMRamMb = (runtime.freeMemory()) / (1024 * 1024);
        var usageJVMRamPercent = (((totalJVMRamMb - freeJVMRamMb) * 1d) / totalJVMRamMb) * 100;
        var usageCpuPercent = os.getSystemCpuLoad() * 100;
        return String.format(
                "JVM RAM Usage: %.2f%%, CPU Usage: %.2f%%, JVM Total RAM: %d MB, JVM Free RAM: %d MB",
                usageJVMRamPercent, usageCpuPercent, totalJVMRamMb, freeJVMRamMb
        );
    }

    @Override
    public void beforeEach(ExtensionContext context) {
        //skip
    }

    @Override
    @SneakyThrows
    public void afterEach(ExtensionContext context) {
        try {
            log.info("{} after test {}", getJvmPerf(), context.getUniqueId());
        } catch (Exception exception) {
            log.error("Cannot log JVM stats: ", exception);
        }
    }

}

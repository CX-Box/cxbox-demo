package core.config.allure;

import io.qameta.allure.listener.TestLifecycleListener;
import io.qameta.allure.model.TestResult;
import net.jcip.annotations.ThreadSafe;

/**
 * Then appends text 'Manual run: ${FQN} ${additionalText}' to the end to test description. Where:
 * <br> 1) FQN is an Allure test path converted to a Maven-style (java method FQN) identifier by replacing the last '.' with '#'.
 * <br> 2) additionalText is constructor input param
 * <br>
 * <br>
 * Example: {@code application.Samples.Form.HintOnFormTest.filtration → application.Samples.Form.HintOnFormTest#filtration}
 * <br>
 * Usage:
 * <pre>{@code
 * @SuppressWarnings("unused")
 * @AutoService(TestLifecycleListener.class)
 * public static class AllureDescAppender extends AbstractAllureDescAppender {
 * 		public AllureDescAppender() {
 * 			super("""see <a href="https://github.com/CX-Box/cxbox-code-samples/actions/workflows/build_button_qa.yml" target="_blank">GitHub Actions</a>""");
 *    }
 * }
 * </pre>
 * <br>
 */
@ThreadSafe
public abstract class AbstractAllureDescAppender implements TestLifecycleListener {

    private final String additionalText;

    public AbstractAllureDescAppender(String additionalText) {
        this.additionalText = additionalText;
    }

    @Override
    public void beforeTestStop(TestResult result) {
        String testName = result.getFullName();
        int lastDotIndex = testName.lastIndexOf('.');
        if (lastDotIndex != -1) {
            var fqn = testName.substring(0, lastDotIndex) + "#" + testName.substring(lastDotIndex + 1);
            String manualRunHtml = """
                        <br><br>
                        <strong>Manual run:</strong>
                        <code style="background:#f6f8fa;padding:4px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:6px;">
                          <button onclick="const b=this,t=document.createElement('textarea');t.value='%s';document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);b.innerText='✅ Copy';setTimeout(()=>b.innerText='📋 Copy ',2000)" style="padding:4px 8px;border:none;border-radius:4px;background:#d0d7de;cursor:pointer;display:flex;align-items:center;"> 📋 Copy </button>
                          %s
                        </code>
                    """.formatted(fqn, fqn) + additionalText;

            result.setDescriptionHtml(result.getDescription() + manualRunHtml);
        }
    }

}
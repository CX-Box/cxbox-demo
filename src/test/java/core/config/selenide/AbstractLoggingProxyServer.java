package core.config.selenide;

import static core.config.selenide.AbstractLoggingProxyServer.HttpUtils.addQueryParam;
import static core.config.selenide.AbstractLoggingProxyServer.HttpUtils.getQueryParam;
import static core.config.selenide.AbstractLoggingProxyServer.HttpUtils.rqString;
import static core.config.selenide.AbstractLoggingProxyServer.HttpUtils.rsString;

import com.browserup.bup.filters.RequestFilter;
import com.browserup.bup.filters.ResponseFilter;
import com.browserup.bup.util.HttpMessageContents;
import com.browserup.bup.util.HttpMessageInfo;
import com.codeborne.selenide.Config;
import com.codeborne.selenide.proxy.SelenideProxyServer;
import com.codeborne.selenide.proxy.SelenideProxyServerFactory;
import io.netty.handler.codec.http.HttpMethod;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpResponse;
import io.netty.handler.codec.http.QueryStringDecoder;
import io.netty.handler.codec.http.QueryStringEncoder;
import java.net.URI;
import java.util.ArrayList;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.function.Predicate;
import javax.annotation.Nullable;
import lombok.NonNull;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import net.jcip.annotations.ThreadSafe;
import org.jetbrains.annotations.NotNull;
import org.openqa.selenium.Proxy;

/**
 * {@code AbstractProxyServer} is a base class for creating a custom {@link com.codeborne.selenide.proxy.SelenideProxyServer}
 * that logs HTTP traffic in Selenide-based tests.
 * <p>
 * It allows you to intercept HTTP requests and responses based on a URL predicate, and log them using your logic (without using RAM hungry HAR capture).
 * Additionally, it appends a unique {@code X-UUID} query parameter to each request to correlate it with its corresponding response.
 *
 * <h2>Logging Behavior</h2>
 * <ul>
 *   <li>Each request and response is logged if its URL matches a provided {@link Predicate}.</li>
 *   <li>The logged output includes the HTTP method, URL, status code (for responses), and body if present.</li>
 *   <li>A unique {@code X-UUID} query parameter is added to the request URL and reused when logging the matching response.</li>
 * </ul>
 *
 * <h2>Usage Example</h2>
 *
 * <pre>{@code
 * @AutoService(SelenideProxyServerFactory.class)
 * public class ProxyServer extends AbstractProxyServer {
 *
 *     public ProxyServer() {
 *         super(Map.of(
 *             "log_api_no_login",
 *             new ProxyLogResponseFilter(
 *                 url -> url.contains("api/v1/") && !url.contains("api/v1/login"),
 *                 LogPerTest.log_api_no_login::trace // Log output will be routed here
 *             )
 *         ));
 *     }
 * }
 * }</pre>
 * <p>
 * This setup will:
 * <ul>
 *   <li>Log all HTTP traffic to {@code /api/v1/} endpoints <strong>excluding</strong> login requests.</li>
 *   <li>Log output via {@code LogPerTest.log_api_no_login.trace(...)}.</li>
 *   <li>Add an {@code X-UUID} to each matching request to track and link it to the corresponding response.</li>
 * </ul>
 *
 * <h2>Example Log Output</h2>
 *
 * <pre>
 * Request: 9f84a456-2ab1-4e0c-a712-8a798ac9b89a
 * GET /api/v1/users
 *
 * Response: 9f84a456-2ab1-4e0c-a712-8a798ac9b89a
 * GET /api/v1/users
 * 200
 * Response Body: [{"id":1,"name":"John"},{"id":2,"name":"Jane"}]
 * </pre>
 * <p><strong>Thread Safety Note:</strong> This class is thread-safe.
 * However, all parallel test threads within the same JVM (such as those spawned by the Surefire plugin using {@code threadCount > 1} and {@code forkCount > 1})
 * will share a single instance of the proxy server.
 * As a result, logs from concurrently running tests may become interleaved and indistinguishable from one another.
 *
 * <p>To ensure clean, isolated logs per test, use a Surefire configuration with {@code threadCount = 1} and {@code forkCount > 1},
 * which spawns each test in a separate JVM process. This setup guarantees no log mixing between tests.
 *
 * @see ProxyLogFilter for request/response matching and log formatting
 * @see com.codeborne.selenide.proxy.SelenideProxyServer for proxy integration
 */
@ThreadSafe
public abstract class AbstractLoggingProxyServer implements SelenideProxyServerFactory {

    private final Map<String, ProxyLogFilter> loggers;

    public AbstractLoggingProxyServer(@NonNull Map<String, ProxyLogFilter> loggers) {
        this.loggers = loggers;
    }

    @NotNull
    @Override
    public SelenideProxyServer create(@NonNull Config config, @Nullable Proxy userProvidedProxy) {
        var proxy = new SelenideProxyServer(config, userProvidedProxy);
        loggers.forEach((name, logger) -> {
            proxy.addRequestFilter(name, logger);
            proxy.addResponseFilter(name, logger);
        });
        proxy.start();
        return proxy;
    }

    @Slf4j
    public static class ProxyLogFilter implements ResponseFilter, RequestFilter {

        private final Predicate<String> urlPredicate;
        private final Consumer<String> rqConsumer;

        public ProxyLogFilter(Predicate<String> urlPredicate, Consumer<String> rqConsumer) {
            this.urlPredicate = urlPredicate;
            this.rqConsumer = rqConsumer;
        }

        public static final String X_UUID = "x-uuid";

        @Override
        public HttpResponse filterRequest(HttpRequest rq, HttpMessageContents rqContents, HttpMessageInfo messageInfo) {
            var method = messageInfo.getOriginalRequest().method();
            var url = rq.uri();
            if (urlPredicate.test(url)) {
                var uuid = UUID.randomUUID().toString();
                rqConsumer.accept(rqString(uuid, url, method, rqContents));
                rq.setUri(addQueryParam(rq.uri(), X_UUID, uuid));
            }
            return null;
        }

        @Override
        public void filterResponse(HttpResponse rs, HttpMessageContents rsContents, HttpMessageInfo rsMessageInfo) {
            var method = rsMessageInfo.getOriginalRequest().method();
            var url = rsMessageInfo.getOriginalUrl(); //without added X_UUID
            if (urlPredicate.test(url)) {
                var uuid = getQueryParam(rsMessageInfo.getUrl(), X_UUID);
                rqConsumer.accept(rsString(uuid, url, method, rs, rsContents));
            }
        }

    }

    public static class HttpUtils {

        @NonNull
        public static String rqString(
                @Nullable String uuid,
                @NonNull String url,
                @NonNull HttpMethod method,
                @Nullable HttpMessageContents rqContents) {
            return "\nRequest: " + uuid + " " +
                    "\n" + method + " " + url +
                    Optional.ofNullable(rqContents)
                            .map(HttpMessageContents::getTextContents)
                            .map(s -> !s.isBlank() ? "\nRequest Body: " + s : "")
                            .orElse("") +
                    "\n";
        }

        @NonNull
        public static String rsString(
                @Nullable String uuid,
                @NonNull String url,
                @NonNull HttpMethod method,
                @NonNull HttpResponse rs,
                @Nullable HttpMessageContents rsContents) {
            return "\nResponse: " + uuid + " " +
                    "\n" + method.name() + " " + url +
                    "\n" + rs.status() +
                    Optional.ofNullable(rsContents)
                            .map(HttpMessageContents::getTextContents)
                            .map(s -> !s.isBlank() ? "\nResponse Body: " + s : "")
                            .orElse("") +
                    "\n";
        }

        @NonNull
        @SneakyThrows
        public static String addQueryParam(@NonNull String url, @NonNull String key, @Nullable String value) {
            var uri = new URI(url);
            var decoder = new QueryStringDecoder(uri);
            var encoder = new QueryStringEncoder(decoder.path());
            if (decoder.parameters() != null) {
                decoder.parameters().forEach((k, v) -> v.forEach(val -> encoder.addParam(k, val)));
            }
            encoder.addParam(key, value);
            var portPart = (uri.getPort() == -1) ? "" : ":" + uri.getPort();
            return uri.getScheme() + "://" + uri.getHost() + portPart + encoder;
        }

        @Nullable
        @SneakyThrows
        public static String getQueryParam(@NonNull String uri, @NonNull String paramName) {
            var parameters = new QueryStringDecoder(uri).parameters();
            var vals = parameters != null ? parameters.get(paramName) : new ArrayList<String>();
            return vals != null ? vals.stream().filter(Objects::nonNull).findFirst().orElse(null) : null;
        }

    }

}

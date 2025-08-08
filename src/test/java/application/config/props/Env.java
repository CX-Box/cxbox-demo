package application.config.props;

import java.net.URI;
import java.net.URL;
import javax.annotation.Nullable;
import lombok.NonNull;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;

@UtilityClass
public class Env {

    public static boolean videoEnabled() {
        return "true".equalsIgnoreCase(System.getenv("CXBOX_RECORDER"));
    }

    public static boolean logEnabled() {
        return "true".equalsIgnoreCase(System.getenv("CXBOX_LOGGER"));
    }

    @NonNull
    @SneakyThrows
    public static URI uri() {
        var url = System.getenv("APP_URL");

        if (!isValidURL(url)) {
            return new URI("http://demo.cxbox.org/ui/#/");
        }
        return new URI(url);
    }

    @SneakyThrows
    static boolean isValidURL(@Nullable String url) {
        try {
            new URL(url).toURI();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}

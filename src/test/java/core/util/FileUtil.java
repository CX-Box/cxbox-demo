package core.util;

import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import lombok.NonNull;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveOutputStream;
import org.apache.commons.io.IOUtils;

@UtilityClass
public class FileUtil {

    /**
     * Creates a temporary zip file containing a single entry with the given file name and content.
     * The created zip file is stored temporarily and marked for deletion on jvm stop.
     *
     * @param fileName the name of the file to be included in the zip archive
     * @param content  the content to be written into the file within the zip archive
     * @return an InputStream for reading the created temporary zip file
     */
    @NonNull
    @SneakyThrows
    public static InputStream toZip(@NonNull String fileName, @NonNull StringBuilder content) {
        var tempZip = Files.createTempFile("tempZip-" + UUID.randomUUID(), ".zip");
        try (var os = Files.newOutputStream(tempZip);
             var zos = new ZipArchiveOutputStream(os);
             var reader = new StringReader(content.toString());
             var writer = new OutputStreamWriter(zos, StandardCharsets.UTF_8)) {

            var entry = new ZipArchiveEntry(fileName);
            zos.putArchiveEntry(entry);

            IOUtils.copyLarge(reader, writer);
            writer.flush();

            zos.closeArchiveEntry();
            zos.finish();
        }
        tempZip.toFile().deleteOnExit();
        return newInputStreamSneaky(tempZip);
    }

    @SneakyThrows
    public static InputStream newInputStreamSneaky(Path tempZip) {
        return Files.newInputStream(tempZip);
    }

}

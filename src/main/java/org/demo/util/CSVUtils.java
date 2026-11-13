package org.demo.util;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.NonNull;
import lombok.experimental.UtilityClass;
import org.cxbox.core.file.dto.FileDownloadDto;

@UtilityClass
public class CSVUtils {

	public static FileDownloadDto toCsv(@NonNull List<String> header, @NonNull Stream<List<String>> body, @NonNull String name, @NonNull String delimiter) {
		var csv = Stream.concat(Stream.of(header), body)
				.map(data -> convertToCSV(data, delimiter))
				.collect(Collectors.joining("\n"));
		byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
		return new FileDownloadDto(
				() -> new ByteArrayInputStream(bytes),
				bytes.length,
				name,
				"text/csv"
		);
	}

	private static String convertToCSV(@NonNull List<String> data, @NonNull String delimiter) {
		return data.stream()
				.map(CSVUtils::escapeSpecialCharacters)
				.collect(Collectors.joining(delimiter));
	}

	private static String escapeSpecialCharacters(@NonNull String data) {
		String escapedData = data.replaceAll("\\R", " ");
		if (data.contains(",") || data.contains("\"") || data.contains("'")) {
			data = data.replace("\"", "\"\"");
			escapedData = "\"" + data + "\"";
		}
		return escapedData;
	}
}

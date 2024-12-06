package org.demo.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.NonNull;
import lombok.experimental.UtilityClass;
import org.cxbox.core.file.dto.FileDownloadDto;

@UtilityClass
public class CSVUtils {

	public static FileDownloadDto toCsv(@NonNull List<String> header, @NonNull Stream<List<String>> body, @NonNull String name, @NonNull String delimiter)
			throws IOException {
		var csv = Stream.concat(Stream.of(header), body)
				.map(data -> convertToCSV(data, delimiter))
				.collect(Collectors.joining("\n"));
		var tmpFile = File.createTempFile(UUID.randomUUID().toString(), name);
		try (FileWriter writer = new FileWriter(tmpFile)) {
			writer.write(csv);
		}
		return new FileDownloadDto(
				() -> {
					try {
						return new FileInputStream(tmpFile);
					} catch (FileNotFoundException e) {
						throw new IllegalStateException(e);
					}
				},
				tmpFile.length(),
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

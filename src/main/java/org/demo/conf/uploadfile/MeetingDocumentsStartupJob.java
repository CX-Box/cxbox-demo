package org.demo.conf.uploadfile;

import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


@RequiredArgsConstructor
@ConditionalOnProperty(
		name = "app.init.files.enabled",
		havingValue = "true",
		matchIfMissing = true
)
public class MeetingDocumentsStartupJob implements ApplicationRunner {

	private final PdfUploadMeetingDocuments pdfUploadMeetingDocuments;

	@Override
	public void run(ApplicationArguments args) throws IOException {
		pdfUploadMeetingDocuments.uploadPdf(1L);
	}
}
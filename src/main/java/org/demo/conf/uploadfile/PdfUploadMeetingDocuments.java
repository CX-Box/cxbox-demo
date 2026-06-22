package org.demo.conf.uploadfile;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.demo.conf.cxbox.customization.file.FileService;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.enums.DocumentStatus;
import org.demo.repository.MeetingDocumentsRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PdfUploadMeetingDocuments {

	private final FileService fileService;

	private final MeetingDocumentsRepository meetingDocumentsRepository;

	@Profile("!oracle-test")
	@EventListener(ApplicationReadyEvent.class)
	public void uploadPdf() {
		try {
			Optional<MeetingDocuments> meetingDocuments = meetingDocumentsRepository.findById(1L);
			if (meetingDocuments.isPresent()) {
				meetingDocuments.get().setFile("meeting.pdf");
				meetingDocuments.get().setFileId(getFileId("meeting.pdf", "application/pdf"));

				meetingDocuments.get().setFileEncrypt("MyEncrypt.enc");
				meetingDocuments.get().setFileEncryptId(getFileId("MyEncrypt.enc", "application/pdf"));

				meetingDocuments.get().setFileSign("MySign.sig");
				meetingDocuments.get().setFileSignId(getFileId("MySign.sig", "application/pdf"));

				meetingDocuments.get().setFileEncryptAndSign("meeting.zip");
				meetingDocuments.get().setFileEncryptAndSignId(getFileId("meeting.zip", "application/zip"));

				meetingDocuments.get().setStatus(DocumentStatus.SIGNED);

				meetingDocumentsRepository.save(meetingDocuments.get());
			}

		} catch (Exception e) {
			throw new IllegalStateException("Failed to upload PDF to MinIO", e);
		}
	}

	private String getFileId(String objectName, String type) throws IOException {
		ClassPathResource resource = new ClassPathResource("signdoc/" + objectName);

		FileDownloadDto file = new FileDownloadDto(
				() -> {
					try {
						return new FileInputStream(resource.getFile());
					} catch (IOException e) {
						throw new RuntimeException(e);
					}
				},
				resource.contentLength(),
				objectName,
				type
		);

		return fileService.upload(file, objectName);
	}

}
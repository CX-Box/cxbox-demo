package org.demo.conf.uploadfile;

import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.demo.conf.cxbox.customization.file.FileService;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.enums.DocumentStatus;
import org.demo.repository.MeetingDocumentsRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PdfUploadMeetingDocuments {

	private static final String RESOURCE_PATH = "classpath:signdoc/";

	private final ResourceLoader resourceLoader;

	private final FileService fileService;

	private final MeetingDocumentsRepository meetingDocumentsRepository;

	public void uploadPdf(Long meetingDocumentId) {
		MeetingDocuments meetingDocuments = meetingDocumentsRepository.findById(meetingDocumentId)
				.orElseThrow(() -> new IllegalArgumentException(
						"Meeting document not found: " + meetingDocumentId
				));

		meetingDocuments.setFile("meeting.pdf");
		meetingDocuments.setFileId(uploadFile("meeting.pdf", "application/pdf"));

		meetingDocuments.setFileEncrypt("MyEncrypt.enc");
		meetingDocuments.setFileEncryptId(uploadFile("MyEncrypt.enc", "application/pdf"));

		meetingDocuments.setFileSign("MySign.sig");
		meetingDocuments.setFileSignId(uploadFile("MySign.sig", "application/pdf"));

		meetingDocuments.setFileEncryptAndSign("meeting.zip");
		meetingDocuments.setFileEncryptAndSignId(uploadFile("meeting.zip", "application/zip"));

		meetingDocuments.setStatus(DocumentStatus.SIGNED);

		meetingDocumentsRepository.save(meetingDocuments);

	}

	@SneakyThrows
	private String uploadFile(String objectName, String type) {
		Resource resource = resourceLoader.getResource(RESOURCE_PATH + objectName);
		InputStream inputStream = resource.getInputStream();
		long contentLength = resource.contentLength();

		FileDownloadDto file = new FileDownloadDto(
				() -> inputStream,
				contentLength,
				objectName,
				type
		);

		return fileService.upload(file, objectName);
	}

}
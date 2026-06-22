package org.demo.conf.uploadfile;

import java.io.IOException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.demo.conf.cxbox.customization.file.FileService;
import org.demo.entity.MeetingDocuments;
import org.demo.entity.enums.DocumentStatus;
import org.demo.repository.MeetingDocumentsRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PdfUploadMeetingDocuments {

	private final FileService fileService;

	private final MeetingDocumentsRepository meetingDocumentsRepository;

	public void uploadPdf(Long meetingDocumentId) throws IOException {
		try {
			Optional<MeetingDocuments> meetingDocuments = meetingDocumentsRepository.findById(meetingDocumentId);
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

	@SneakyThrows
	private String getFileId(String objectName, String type) throws IOException {

		ClassPathResource resource = new ClassPathResource("signdoc/" + objectName);

		FileDownloadDto file = new FileDownloadDto(
				resource::getInputStream,
				resource.contentLength(),
				objectName,
				type
		);

		return fileService.upload(file, objectName);
	}

}
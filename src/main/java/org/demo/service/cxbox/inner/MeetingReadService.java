package org.demo.service.cxbox.inner;

import static org.demo.conf.cxbox.customization.file.CxboxDemoMinioFileController.FILENAME_FIELD;
import static org.demo.conf.cxbox.customization.file.CxboxDemoMinioFileController.FIVE_MIB;

import io.minio.MinioClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.core.service.action.CxboxActionIconSpecifier;
import org.cxbox.core.util.session.SessionService;
import org.demo.conf.cxbox.customization.icon.ActionIcon;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.integration.AirMessageRs;
import org.demo.dto.integration.StableDiffusionRq;
import org.demo.dto.integration.StableDiffusionRs;
import org.demo.entity.Meeting;
import org.demo.entity.MeetingDocuments;
import org.demo.repository.MeetingDocumentsRepository;
import org.demo.repository.MeetingRepository;
import org.demo.repository.core.UserRepository;
import org.demo.service.statemodel.MeetingStatusModelActionProvider;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestTemplate;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
@Slf4j
public class MeetingReadService extends VersionAwareResponseService<MeetingDTO, Meeting> {

	private final MeetingRepository meetingRepository;

	private final UserRepository userRepository;

	private final SessionService sessionService;

	private final MeetingStatusModelActionProvider statusModelActionProvider;

	@Autowired
	private RestTemplate restTemplate;

	@Autowired
	private MinioClient minioClient;

	@Value("${minio.bucket.name}")
	String defaultBucketName;

	@Autowired
	private MeetingDocumentsRepository meetingDocumentsRepository;

	public MeetingReadService(MeetingRepository meetingRepository, UserRepository userRepository,
			SessionService sessionService,
			MeetingStatusModelActionProvider statusModelActionProvider) {
		super(MeetingDTO.class, Meeting.class, null, MeetingReadMeta.class);
		this.meetingRepository = meetingRepository;
		this.userRepository = userRepository;
		this.sessionService = sessionService;
		this.statusModelActionProvider = statusModelActionProvider;
	}

	@Override
	protected CreateResult<MeetingDTO> doCreateEntity(Meeting entity, BusinessComponent bc) {
		entity.setResponsible(userRepository.getReferenceById(sessionService.getSessionUser().getId()));
		meetingRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						String.format(
								"/screen/meeting/view/meetingedit/%s/%s",
								CxboxRestController.meetingEdit,
								entity.getId()
						)
				));
	}

	@Override
	protected ActionResultDTO<MeetingDTO> doUpdateEntity(Meeting entity, MeetingDTO data, BusinessComponent bc) {
		throw new UnsupportedOperationException();
	}

	@Override
	public Actions<MeetingDTO> getActions() {
		return Actions.<MeetingDTO>builder()
				.newAction()
				.action("generate", "Generate")
				.scope(ActionScope.RECORD)
				.withoutAutoSaveBefore()
				.invoker((bc, data) -> {
					List<String> fileUrls = generateImage();
					fileUrls.forEach(fileUrl -> {
						UploadUrlToTemporaryFile result = getUploadUrlToTemporaryFile(fileUrl);
						String id = uploadTempFileToMinio(result.contentType(), result.file().getName(), getStream(result.file()));
						var meetingDocuments = new MeetingDocuments();
						var fileId = id;
						meetingDocuments.setMeeting(meetingRepository.findById(bc.getIdAsLong()).get());
						meetingDocuments.setFileId(fileId);
						var fileName = result.file().getName();
						meetingDocuments.setFile(fileName);
						meetingDocumentsRepository.save(meetingDocuments);
					});

					return new ActionResultDTO<MeetingDTO>();
				})
				.add()
				.create().text("Add").add()
				.cancelCreate().text("Cancel").withIcon(CxboxActionIconSpecifier.CLOSE, false).add()
				.addGroup(
						"actions",
						"Actions",
						0,
						addEditAction(statusModelActionProvider.getMeetingActions()).build()
				)
				.withIcon(ActionIcon.MENU, false)
				.build();
	}

	@SneakyThrows
	public String uploadTempFileToMinio(String contentType, String fileName, FileInputStream stream) {
		ObjectWriteResponse objectWriteResponse = minioClient.putObject(PutObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(UUID.randomUUID().toString())
				.contentType(contentType)
				.userMetadata(Collections.singletonMap(FILENAME_FIELD, fileName))
				.stream(stream, -1, FIVE_MIB)
				.build()
		);
		return objectWriteResponse.object();
	}

	@SneakyThrows
	private @NotNull UploadUrlToTemporaryFile getUploadUrlToTemporaryFile(String fileUrl) {
		/*AtomicReference<MediaType> contentTypeAtomic = new AtomicReference<>();
		File file = restTemplate.execute(fileUrl, HttpMethod.GET, null, clientHttpResponse -> {
			File ret = File.createTempFile("download", "tmp");
			StreamUtils.copy(clientHttpResponse.getBody(), new FileOutputStream(ret));
			contentTypeAtomic.set(clientHttpResponse.getHeaders().getContentType());
			return ret;
		});

		String contentType = contentTypeAtomic.get().getType();*/

		URL url = new URL(fileUrl);
		String path = url.getPath();
		String fileName = path.substring(path.lastIndexOf('/') + 1);
		URLConnection urlConnection = url.openConnection();
		String contentType = urlConnection.getContentType();
		InputStream in = url.openStream();
		File ret = File.createTempFile("tmp", fileName);
		Files.copy(in, ret.toPath(), StandardCopyOption.REPLACE_EXISTING);
		log.info(ret.getAbsolutePath());
		return new UploadUrlToTemporaryFile(ret, contentType);
	}

	private record UploadUrlToTemporaryFile(File file, String contentType) {

	}

	private List<String> generateImage() {
		String url = "https://api.air.fail/public/image/stablediffusion";
		HttpHeaders headers = new HttpHeaders();
		headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
		headers.set("Authorization", "sk-Ud30R_w54r7it87iAEyOxwr0mBMt2");
		headers.setContentType(MediaType.APPLICATION_JSON);
		StableDiffusionRq content = StableDiffusionRq.builder().content("icecream").build();
		HttpEntity<StableDiffusionRq> request = new HttpEntity<>(content, headers);
		ResponseEntity<List<StableDiffusionRs>> response = restTemplate.exchange(
				url,
				HttpMethod.POST,
				request,
				new ParameterizedTypeReference<List<StableDiffusionRs>>() {
				}
		);
		return response.getBody().stream().map(AirMessageRs::getFile).toList();

	}

	@SneakyThrows
	private static @NotNull FileInputStream getStream(File file) {
		return new FileInputStream(file);
	}

	private ActionsBuilder<MeetingDTO> addEditAction(ActionsBuilder<MeetingDTO> builder) {
		return builder
				.newAction()
				.action("edit", "Edit")
				.scope(ActionScope.RECORD)
				.withoutAutoSaveBefore()
				.invoker((bc, data) -> new ActionResultDTO<MeetingDTO>()
						.setAction(PostAction.drillDown(
								DrillDownType.INNER,
								"/screen/meeting/view/meetingedit/" +
										CxboxRestController.meetingEdit + "/" +
										bc.getId()
						)))
				.add();
	}


	@Override
	public boolean isDeferredCreationSupported(BusinessComponent bc) {
		return false;
	}

}

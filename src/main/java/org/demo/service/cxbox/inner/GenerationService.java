package org.demo.service.cxbox.inner;


import static org.demo.conf.cxbox.customization.file.CxboxDemoMinioFileController.FILENAME_FIELD;
import static org.demo.conf.cxbox.customization.file.CxboxDemoMinioFileController.FIVE_MIB;

import io.minio.MinioClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
import org.demo.conf.cxbox.customization.file.CustomFileServices;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.GenerationDTO;
import org.demo.dto.cxbox.inner.GenerationDTO_;
import org.demo.dto.cxbox.inner.GenerationDocumentsDTO;
import org.demo.dto.integration.AirMessageRs;
import org.demo.dto.integration.StableDiffusionRq;
import org.demo.dto.integration.StableDiffusionRq.Info;
import org.demo.dto.integration.StableDiffusionRs;
import org.demo.entity.Generation;
import org.demo.entity.GenerationDocuments;
import org.demo.repository.GenerationDocumentsRepository;
import org.demo.repository.GenerationRepository;
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
import org.springframework.util.Base64Utils;
import org.springframework.web.client.RestTemplate;

@Slf4j
@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class GenerationService extends VersionAwareResponseService<GenerationDTO, Generation> {

	@Autowired
	private GenerationDocumentsRepository generationDocumentsRepository;

	@Autowired
	private GenerationRepository generationRepository;

	@Autowired
	private MinioClient minioClient; //TODO>>refactor to decouple code with CxboxDemoMinioFileController

	@Value("${minio.bucket.name}")
	private String defaultBucketName; //TODO>>refactor to decouple code with CxboxDemoMinioFileController

	@Autowired
	private CustomFileServices customFileServices;

	@Autowired
	private RestTemplate restTemplate;

	public GenerationService() {
		super(GenerationDTO.class, Generation.class, null, GenerationMeta.class);
	}

	@Override
	protected CreateResult<GenerationDTO> doCreateEntity(Generation entity, BusinessComponent bc) {
		generationRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity))
				.setAction(PostAction.drillDown(
						DrillDownType.INNER,
						"/screen/generation/view/generation/" + CxboxRestController.generation + "/" + entity.getId()
				));
	}

	@Override
	protected ActionResultDTO<GenerationDTO> doUpdateEntity(Generation entity, GenerationDTO data, BusinessComponent bc) {
		if (data.isFieldChanged(GenerationDTO_.overridePrompt)) {
			entity.setOverridePrompt(data.getOverridePrompt());
		}
		if (data.isFieldChanged(GenerationDTO_.name)) {
			entity.setName(data.getName());
		}
		if (data.isFieldChanged(GenerationDTO_.detalization)) {
			entity.setDetalization(data.getDetalization());
		}
		if (data.isFieldChanged(GenerationDTO_.style)) {
			entity.setStyle(data.getStyle());
		}
		generationRepository.save(entity);
		return new ActionResultDTO<>(entityToDto(bc, entity));
	}

	@Override
	public ActionResultDTO onCancel(BusinessComponent bc) {
		return new ActionResultDTO<>().setAction(PostAction.drillDown(
				DrillDownType.INNER,
				"/screen/meeting/"
		));
	}

	@Override
	public Actions<GenerationDTO> getActions() {
		return Actions.<GenerationDTO>builder()
				.save().add()
				.cancelCreate().text("Cancel").available(bc -> true).add()
				.create().text("Add").add()
				.newAction()
				.action("generate", "Generate")
				.scope(ActionScope.RECORD)
				.withAutoSaveBefore()
				.invoker((bc, data) -> {
					Generation generation = generationRepository.findById(bc.getIdAsLong()).get();
					String prompt = generation.getOverridePrompt() != null? generation.getOverridePrompt(): generation.getName() + ", " + generation.getStyle().getPromt() + ", " + generation.getDetalization().getPromt();
					log.info("prompt = " + prompt);
					for (int i = 0; i < 4; i++) {
						generateAndSave(prompt, generation);
					}
					return new ActionResultDTO<>();
				})
				.add()
				.build();
	}

	private void generateAndSave(String prompt, Generation generation) {
		List<String> fileUrls = generateImage(prompt);
		fileUrls.forEach(fileUrl -> {
			UploadUrlToTemporaryFile result = getUploadUrlToTemporaryFile(fileUrl);
			String id = uploadTempFileToMinio(result.contentType(), result.file().getName(), getStream(result.file()));
			var docs = new GenerationDocuments();
			var fileId = id;

			docs.setGeneration(generation);
			docs.setFileId(fileId);
			docs.setFieldKeyForContentType(result.contentType());
			docs.setFieldKeyForBase64(Base64Utils.encode(getBytes(result.file())));
			var fileName = result.file().getName();
			docs.setFile(fileName);
			generationDocumentsRepository.save(docs);
		});
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
		return new UploadUrlToTemporaryFile(ret, contentType);
	}

	private record UploadUrlToTemporaryFile(File file, String contentType) {

	}

	private List<String> generateImage(String prompt) {
		String url = "https://api.air.fail/public/image/stablediffusion";
		HttpHeaders headers = new HttpHeaders();
		headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
		headers.set("Authorization", "sk-Ud30R_w54r7it87iAEyOxwr0mBMt2");
		headers.setContentType(MediaType.APPLICATION_JSON);
		StableDiffusionRq content = StableDiffusionRq.builder().content(prompt).build();
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
	private static @NotNull byte[] getBytes(File file) {
		return new FileInputStream(file).readAllBytes();
	}

	@SneakyThrows
	private static @NotNull FileInputStream getStream(File file) {
		return new FileInputStream(file);
	}

}

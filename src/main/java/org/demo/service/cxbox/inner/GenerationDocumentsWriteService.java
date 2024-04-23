package org.demo.service.cxbox.inner;

import static org.demo.conf.cxbox.customization.file.CxboxDemoMinioFileController.FILENAME_FIELD;
import static org.demo.conf.cxbox.customization.file.CxboxDemoMinioFileController.FIVE_MIB;
import static org.demo.dto.cxbox.inner.GenerationDocumentsDTO_.notes;

import io.minio.MinioClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.SneakyThrows;
import org.cxbox.api.data.dto.AssociateDTO;
import org.cxbox.core.crudma.bc.BusinessComponent;
import org.cxbox.core.crudma.impl.VersionAwareResponseService;
import org.cxbox.core.dto.DrillDownType;
import org.cxbox.core.dto.rowmeta.ActionResultDTO;
import org.cxbox.core.dto.rowmeta.AssociateResultDTO;
import org.cxbox.core.dto.rowmeta.CreateResult;
import org.cxbox.core.dto.rowmeta.PostAction;
import org.cxbox.core.service.action.ActionScope;
import org.cxbox.core.service.action.Actions;
import org.cxbox.core.service.action.ActionsBuilder;
import org.cxbox.model.core.entity.BaseEntity_;
import org.demo.conf.cxbox.customization.file.CustomFileServices;
import org.demo.controller.CxboxRestController;
import org.demo.dto.cxbox.inner.GenerationDocumentsDTO;
import org.demo.dto.cxbox.inner.GenerationDocumentsDTO_;
import org.demo.dto.cxbox.inner.MeetingDTO;
import org.demo.dto.integration.AirMessageRs;
import org.demo.dto.integration.StableDiffusionRq;
import org.demo.dto.integration.StableDiffusionRs;
import org.demo.entity.Generation;
import org.demo.entity.GenerationDocuments;
import org.demo.entity.GenerationDocuments_;
import org.demo.repository.GenerationDocumentsRepository;
import org.demo.repository.GenerationRepository;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.Base64Utils;
import org.springframework.web.client.RestTemplate;

@SuppressWarnings({"java:S3252", "java:S1186"})
@Service
public class GenerationDocumentsWriteService extends VersionAwareResponseService<GenerationDocumentsDTO, GenerationDocuments> {

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

	public GenerationDocumentsWriteService() {
		super(GenerationDocumentsDTO.class, GenerationDocuments.class, null, GenerationDocumentsWriteMeta.class);
	}

	@Override
	protected Specification<GenerationDocuments> getParentSpecification(BusinessComponent bc) {
		return (root, cq, cb) -> cb.and(
				super.getParentSpecification(bc).toPredicate(root, cq, cb),
				cb.equal(root.get(GenerationDocuments_.generation).get(BaseEntity_.id), bc.getParentIdAsLong())
		);

	}

	@Override
	protected CreateResult<GenerationDocumentsDTO> doCreateEntity(GenerationDocuments entity, BusinessComponent bc) {
		Generation meeting = generationRepository.findById(bc.getParentIdAsLong()).orElse(null);
		entity.setGeneration(meeting);
		generationDocumentsRepository.save(entity);
		return new CreateResult<>(entityToDto(bc, entity));
	}

	@Override
	protected ActionResultDTO<GenerationDocumentsDTO> doUpdateEntity(GenerationDocuments entity, GenerationDocumentsDTO data,
			BusinessComponent bc) {
		if (data.isFieldChanged(GenerationDocumentsDTO_.fileId)) {
			entity.setFileId(data.getFileId());
		}
		if (data.isFieldChanged(GenerationDocumentsDTO_.file)) {
			entity.setFile(data.getFile());
			if (data.getFileId() != null) {
				entity.setFieldKeyForContentType(customFileServices.getStatData(data.getFileId()).contentType());
				entity.setFieldKeyForBase64(Base64Utils.encode(customFileServices.getObject(data.getFileId())));
			}
		}
		setIfChanged(data, notes, entity::setNotes);

		generationDocumentsRepository.save(entity);
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
	protected AssociateResultDTO doAssociate(List<AssociateDTO> data, BusinessComponent bc) {
		List<GenerationDocuments> meetingDocuments = fileUpload(bc, data);
		List<GenerationDocumentsDTO> collect = meetingDocuments.stream().map(e -> entityToDto(bc, e))
				.collect(Collectors.toList());
		return new AssociateResultDTO((List) collect)
				.setAction(PostAction.refreshBc(bc));
	}

	@SneakyThrows
	private List<GenerationDocuments> fileUpload(BusinessComponent bc, List<AssociateDTO> fileIds) {
		List<GenerationDocuments> meetingDocumentsList = new ArrayList<>();
		for (AssociateDTO item : fileIds) {
			var meetingDocuments = new GenerationDocuments();
			var fileId = item.getId();
			meetingDocuments.setGeneration(generationRepository.findById(bc.getParentIdAsLong()).get());
			meetingDocuments.setFileId(fileId);
			var statObjectResponse = minioClient.statObject(StatObjectArgs
					.builder()
					.bucket(defaultBucketName)
					.object(fileId)
					.build()
			);
			var fileName = statObjectResponse.userMetadata().get(FILENAME_FIELD);
			meetingDocuments.setFile(fileName);
			meetingDocumentsList.add(generationDocumentsRepository.save(meetingDocuments));

		}
		return meetingDocumentsList;
	}

}

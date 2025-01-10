package org.demo.conf.cxbox.customization.file;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MinioClient;
import io.minio.ObjectWriteResponse;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import java.util.Collections;
import java.util.UUID;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.cxbox.core.file.dto.FileDownloadDto;
import org.cxbox.core.file.service.CxboxFileService;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FileService implements CxboxFileService {

	public static final String FILENAME_FIELD = "filename";
	public static final	int FIVE_MIB = 5242880;

	private final MinioClient minioClient;

	@Value("${minio.bucket.name}")
	private final String defaultBucketName;

	@SneakyThrows
	@Override
	public <D extends FileDownloadDto> String upload(@NonNull D file, @Nullable String source) {
		var contentType = file.getType();
		var name = file.getName();
		ObjectWriteResponse objectWriteResponse = minioClient.putObject(PutObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(UUID.randomUUID().toString())
				.contentType(contentType)
				.userMetadata(Collections.singletonMap(FILENAME_FIELD, name))
				.stream(file.getContent().get(), -1, FIVE_MIB)
				.build()
		);
		return objectWriteResponse.object();
	}

	@SneakyThrows
	@Override
	public FileDownloadDto download(@NonNull String id, @Nullable String source) {
		StatObjectResponse statObjectResponse = minioClient.statObject(StatObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(id)
				.build()
		);
		return new FileDownloadDto(
				() -> getObject(id), statObjectResponse.size(),
				statObjectResponse.userMetadata().get(FILENAME_FIELD),
				statObjectResponse.contentType()
		);
	}

	@SneakyThrows
	private GetObjectResponse getObject(@NotNull String id) {
		return minioClient.getObject(GetObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(id)
				.build()
		);
	}

	@SneakyThrows
	@Override
	public void remove(@NonNull String id, @Nullable String source) {
		minioClient.removeObject(RemoveObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(id)
				.build()
		);
	}

}

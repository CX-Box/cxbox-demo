package org.demo.service.core.file;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import java.io.InputStream;
import lombok.SneakyThrows;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


@Service
public class CustomFileServices {

	private final MinioClient minioClient;

	private final String defaultBucketName;


	public CustomFileServices(
			MinioClient minioClient,
			@Value("${minio.bucket.name}") String defaultBucketName) {
		this.minioClient = minioClient;
		this.defaultBucketName = defaultBucketName;
	}


	@SneakyThrows
	public byte[] getObject(final String id) {
		try (InputStream inputStream = minioClient.getObject(GetObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(id)
				.build())) {
			return IOUtils.toByteArray(inputStream);
		}
	}

	@SneakyThrows
	public StatObjectResponse getStatData(final String id) {
		return minioClient.statObject(StatObjectArgs
				.builder()
				.bucket(defaultBucketName)
				.object(id)
				.build());
	}

}

package org.demo.conf.cxbox.customization.file;

import io.minio.MinioClient;
import org.cxbox.core.file.conf.CxboxFileConfiguration;
import org.cxbox.core.file.service.CxboxFileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({CxboxFileConfiguration.class})
public class CxboxFileConfig {

	@Bean
	CxboxFileService cxboxFileService(MinioClient minioClient, @Value("${minio.bucket.name}") String defaultBucketName) {
		return new FileService(minioClient, defaultBucketName);
	}

	@Bean
	public MinioClient minioClient(
			@Value("${minio.access.name}") String accessKey,
			@Value("${minio.access.secret}") String accessSecret,
			@Value("${minio.url}") String minioUrl) {
		return MinioClient.builder()
				.endpoint(minioUrl)
				.credentials(accessKey, accessSecret)
				.build();
	}

}

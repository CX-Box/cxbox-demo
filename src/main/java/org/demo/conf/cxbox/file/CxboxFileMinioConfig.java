package org.demo.conf.cxbox.file;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CxboxFileMinioConfig {

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

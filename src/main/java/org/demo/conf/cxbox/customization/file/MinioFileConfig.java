package org.demo.conf.cxbox.customization.file;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MinioFileConfig {

	@Bean
	public MinioClient minioClient(
			@Value("${minio.access.name}") String accessKey,
			@Value("${minio.access.secret}") String accessSecret,
			@Value("${minio.url}") String minioUrl,
			@Value("${minio.bucket.name}") String bucketName) {
		MinioClient minioClient = MinioClient.builder()
				.endpoint(minioUrl)
				.credentials(accessKey, accessSecret)
				.build();
		createBucketIfNotExists(minioClient, bucketName);
		return minioClient;
	}

	/**
	 * MinIO with an empty volume has no bucket (MINIO_SKIP_CLIENT=yes in docker-compose-prod.yml: the Bitnami script
	 * does not create MINIO_DEFAULT_BUCKETS). If MinIO is not available, the application starts anyway.
	 */
	private static void createBucketIfNotExists(MinioClient minioClient, String bucketName) {
		try {
			if (!minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build())) {
				minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
				log.info("MinIO bucket {} is created", bucketName);
			}
		} catch (Exception e) {
			log.warn("MinIO bucket {} is not checked, MinIO is not available: {}", bucketName, e.toString());
		}
	}

}

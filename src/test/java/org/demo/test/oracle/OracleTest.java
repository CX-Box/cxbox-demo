package org.demo.test.oracle;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.OracleContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
@ActiveProfiles("oracle-test")
class OracleTest {

	@Container
	static OracleContainer oracle =
			new OracleContainer("gvenzl/oracle-xe:21-slim");

	@DynamicPropertySource
	static void props(DynamicPropertyRegistry r) {
		r.add("spring.datasource.url", oracle::getJdbcUrl);
		r.add("spring.datasource.username", oracle::getUsername);
		r.add("spring.datasource.password", oracle::getPassword);
		r.add("spring.datasource.driver-class-name", oracle::getDriverClassName);

	}

	@Test
	void contextStarts() {
	}

}
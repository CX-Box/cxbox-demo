package org.demo.test;

import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import org.demo.conf.ApplicationConfig;

@WebAppConfiguration
@ExtendWith(SpringExtension.class)
@SpringBootTest
@ContextConfiguration(classes = {ApplicationConfig.class})
@ActiveProfiles("test")
public abstract class TestCase {

}
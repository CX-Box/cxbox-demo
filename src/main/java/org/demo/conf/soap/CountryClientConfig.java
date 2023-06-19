package org.demo.conf.soap;

import org.demo.soap.ProductClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;

@Configuration
public class CountryClientConfig {

	@Bean
	public Jaxb2Marshaller marshaller() {
		Jaxb2Marshaller marshaller = new Jaxb2Marshaller();
		marshaller.setContextPath("org.demo.siebel.product.gen");
		return marshaller;
	}

	@Bean
	public ProductClient productClient(Jaxb2Marshaller marshaller) {
		ProductClient client = new ProductClient();
		client.setDefaultUri(
				"https://rsbwstm0si1.trosbank.trus.tsocgen:8443/siebel/app/eai_anon_rus/rus?SWEExtSource=AnonWebService&SWEExtCmd=Execute");
		client.setMarshaller(marshaller);
		client.setUnmarshaller(marshaller);
		return client;
	}

}
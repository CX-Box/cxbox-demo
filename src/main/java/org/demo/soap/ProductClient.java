package org.demo.soap;

import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.time.Duration;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import org.demo.siebel.product.gen.Run1Input;
import org.demo.siebel.product.gen.Run1Output;
import org.springframework.ws.WebServiceMessage;
import org.springframework.ws.client.core.WebServiceMessageCallback;
import org.springframework.ws.client.core.WebServiceTemplate;
import org.springframework.ws.client.core.support.WebServiceGatewaySupport;
import org.springframework.ws.soap.SoapMessage;
import org.springframework.ws.transport.http.HttpUrlConnectionMessageSender;
import org.springframework.ws.transport.http.HttpsUrlConnectionMessageSender;

public class ProductClient extends WebServiceGatewaySupport {

	public Run1Output getProducts(Run1Input input) {
		WebServiceTemplate template = getWebServiceTemplate();
		HttpsUrlConnectionMessageSender sender = new HttpsUrlConnectionMessageSender();
		sender.setTrustManagers(new TrustManager[]{new UnTrustworthyTrustManager()});
		template.setMessageSender(sender);
		sender.setReadTimeout(Duration.ZERO);
		sender.setConnectionTimeout(Duration.ZERO);
		return (Run1Output) template.marshalSendAndReceive(input,
				message -> ((SoapMessage)message).setSoapAction("document/http://siebel.com/CustomUI:run_1")
		);
	}

	static class UnTrustworthyTrustManager implements X509TrustManager {

		public void checkClientTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
		}

		public void checkServerTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
		}

		public X509Certificate[] getAcceptedIssuers() {
			return null;
		}

	}

}
package org.demo.testforilia.bc1parent;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.cxbox.api.service.session.InternalAuthorizationService;
import org.demo.testforilia.bc1.MyEntity1222;
import org.demo.testforilia.bc1.MyEntity1222Repository;
import org.demo.testforilia.bc3.MyEntity1224;
import org.demo.testforilia.bc3.MyEntity1224Repository;
import org.demo.testforilia.bc4.MyEntity1225;
import org.demo.testforilia.bc4.MyEntity1225Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MyEntity1223TestDataLoadService {

	@Autowired
	MyEntity1223Repository repository;

	@Autowired
	InternalAuthorizationService authzService;

	@Autowired
	MyEntity1224Repository repository2;


	@Autowired
	MyEntity1222Repository repository3;

	@Autowired
	MyEntity1225Repository repository4;

	@Transactional
	@PostConstruct
	public void load() {
		authzService.loginAs(authzService.createAuthentication(InternalAuthorizationService.VANILLA));
		repository.deleteAll();
		repository2.deleteAll();
		repository3.deleteAll();
		repository.save(new MyEntity1223().setCustomField("parent 3"));
		MyEntity1223 ent1  =	new MyEntity1223().setCustomField("parent 1");
		repository.save(ent1);
		MyEntity1223 ent2  =	new MyEntity1223().setCustomField("parent 2");
		repository.save(ent2);

		MyEntity1222 ent122  =	new MyEntity1222().setCustomField("child 1[0]");
		MyEntity1222 ent123  =	new MyEntity1222().setCustomField("child 1[1]");
		MyEntity1222 ent124  =	new MyEntity1222().setCustomField("child 2[0]");
		repository3.save(ent122).setCustomFieldEntity(ent1);
		repository3.save(ent123).setCustomFieldEntity(ent1);
		repository3.save(ent124).setCustomFieldEntity(ent2);
		MyEntity1222 myEntity1222 = new MyEntity1222().setCustomField("child 2[1]").setCustomFieldEntity(ent2);
		repository3.save(myEntity1222);

		repository2.save(new MyEntity1224().setCustomField("child 1[2]").setCustomFieldEntity(ent122));
		repository2.save(new MyEntity1224().setCustomField("child 1[0.0]").setCustomFieldEntity(ent122));

		repository2.save(new MyEntity1224().setCustomField("child 1[1.0]").setCustomFieldEntity(ent123));
		repository2.save(new MyEntity1224().setCustomField("child 1[1.1]").setCustomFieldEntity(ent123));

		repository2.save(new MyEntity1224().setCustomField("child 2[0.0]").setCustomFieldEntity(myEntity1222));

		repository4.deleteAll();
		repository4.save(new MyEntity1225().setCustomField("child 1[3]").setCustomFieldEntity(ent1));
		repository4.save(new MyEntity1225().setCustomField("child 1[4]").setCustomFieldEntity(ent1));
		repository4.save(new MyEntity1225().setCustomField("child 1[5]").setCustomFieldEntity(ent1));

		repository4.save(new MyEntity1225().setCustomField("child 2[2]").setCustomFieldEntity(ent2));
		repository4.save(new MyEntity1225().setCustomField("child 2[3]").setCustomFieldEntity(ent2));
	}

}
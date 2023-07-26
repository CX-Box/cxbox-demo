package org.demo.conf.resp;

import org.cxbox.api.data.dictionary.LOV;
import org.cxbox.core.config.cache.CacheConfig;
import org.cxbox.core.service.impl.ResponsibilitiesServiceImpl;
import org.cxbox.model.core.dao.JpaDao;
import org.cxbox.model.core.entity.User;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service("responsibilitiesServiceImpl")
@Primary
public class CachedResponsibilitiesService extends ResponsibilitiesServiceImpl {

	public CachedResponsibilitiesService(JpaDao jpaDao) {
		super(jpaDao);
	}

	@Override
	@Cacheable(cacheResolver = CacheConfig.CXBOX_CACHE_RESOLVER,
			cacheNames = {CacheConfig.REQUEST_CACHE},
			key = "{#root.methodName, #user.id, #userRole}")
	public Map<String, Boolean> getListRespByUser(User user, LOV userRole) {
		return super.getListRespByUser(user, userRole);
	}

}

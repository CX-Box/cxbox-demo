package org.demo.conf.cxbox.extension.notification.internal;

import org.cxbox.api.service.session.IUser;
import org.demo.conf.cxbox.extension.notification.AbstractNotification;

public interface WebSocketNotificationService {

	<T extends AbstractNotification> void send(T abstractMessage, IUser<Long> user);

}

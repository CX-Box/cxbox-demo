package org.demo.controller;

import static org.cxbox.core.config.properties.APIProperties.CXBOX_API_PATH_SPEL;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.cxbox.core.dto.ResponseDTO;
import org.cxbox.core.util.ResponseBuilder;
import org.demo.service.NotificationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping(CXBOX_API_PATH_SPEL + "/notification")
public class NotificationController {

	private final NotificationService notificationService;

	@GetMapping(value = "/get-notifications")
	public ResponseDTO getNotifications(
			@RequestParam(name = "_page", defaultValue = "1") Integer page,
			@RequestParam(name = "_limit", defaultValue = "5") Integer limit) {

		return ResponseBuilder.build(notificationService.getNotifications(page - 1, limit));
	}

	@GetMapping(value = "/count-notifications")
	public ResponseDTO countNotifications() {

		return ResponseBuilder.build(notificationService.getNotificationCount());
	}


	@PostMapping(value = "/mark-notification-as-read")
	public void markNotificationsAsRead(@RequestBody List<Long> notificationId) {

		notificationService.markAsRead(notificationId);
	}

	@DeleteMapping(value = "/delete-notification")
	public void deleteNotifications(@RequestBody List<Long> notificationId) {

		notificationService.delete(notificationId);
	}

	@GetMapping("/check-new-notification")
	public ResponseDTO checkReadNotification(
			@RequestParam(name = "_mark", defaultValue = "false") Boolean mark) {

		return ResponseBuilder.build(notificationService.getCountWithMark(mark));
	}

}


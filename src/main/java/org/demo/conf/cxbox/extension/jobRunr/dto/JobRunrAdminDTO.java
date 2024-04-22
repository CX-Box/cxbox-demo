package org.demo.conf.cxbox.extension.jobRunr.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;
import lombok.experimental.SuperBuilder;
import org.cxbox.api.data.dto.DataResponseDTO;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@SuperBuilder(toBuilder = true)
public class JobRunrAdminDTO extends DataResponseDTO {
	private Long version;
	private String jobasjson;
	private String jobsignature;
	private String state;
	private LocalDateTime createdat;
	private LocalDateTime updatedat;
	private LocalDateTime scheduledat;
	private String recurringjobid;

}

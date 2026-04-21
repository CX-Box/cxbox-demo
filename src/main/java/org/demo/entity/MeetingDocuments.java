package org.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cxbox.model.core.entity.BaseEntity;
import org.demo.entity.dictionary.Briefings;
import org.demo.entity.enums.Documents;

@Entity
@Table(name = "MEETING_DOCUMENTS")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = {}, callSuper = true)
public class MeetingDocuments extends BaseEntity {

	private String notes;

	@Column(name = "file_name")
	private String file;

	@Column
	private String fileId;

	@ManyToOne
	@JoinColumn(name = "MEETING_ID")
	private Meeting meeting;

	@Column
	private Briefings briefing;

	@Column(name = "document_name")
	@Enumerated(EnumType.STRING)
	private Documents document;

	@Column
	private Long priority;

	@Column
	private String employerSignatureFile;

	@Column
	private String employerSignatureFileId;

}
